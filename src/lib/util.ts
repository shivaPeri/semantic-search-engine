import { initializeApp } from 'firebase/app';
import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, listAll, ref, uploadBytes } from 'firebase/storage';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import { HfInference, HfInferenceEndpoint } from '@huggingface/inference';

///////////////////// FIREBASE

const config = {
	apiKey: 'AIzaSyDZNfxtUg1J47Aj10GQXBWwY-cNxTkg15M',
	authDomain: 'semantic-search-engine-ef68e.firebaseapp.com',
	projectId: 'semantic-search-engine-ef68e',
	storageBucket: 'semantic-search-engine-ef68e.appspot.com',
	messagingSenderId: '825183710628',
	appId: '1:825183710628:web:070453f999b1331df62531'
};

// Initialize Firebase
const app = initializeApp(config);

// initialize Database and Storage
// database stores file metadata and embeddings
// storage stores the actual files
export const db = getFirestore();
export const storage = getStorage(app);
const filesRef = ref(storage, '');

// initialize Authentication (only for users who want to upload files)
export const auth = getAuth();
export const provider = new GoogleAuthProvider();

///////////////////// HUGGINGFACE

const hf_key = import.meta.env.VITE_HF_ACCESS_TOKEN;
const hf = new HfInference(hf_key);

///////////////////// FUNCTIONS

export const uploadFiles = async (files: FileList) => {
	console.log(files);
	for (let i = 0; i < files.length; i++) {
		let file = files.item(i);
		if (file === null) {
			continue;
		}

		let name = file.name;
		let type = file.type.includes('image') ? 'image' : 'text';

		// upload file to storage
		let storageRef = ref(storage, name);
		await uploadBytes(storageRef, file);

		// get description via HFInference
		let desc: string;
		if (type == 'image') desc = await captionImage(file);
		else desc = await summarize(file);

		let url = await getDownloadURL(storageRef);

		// add file to database
		let doc = {
			name: name,
			type: type,
			url: url,
			description: desc
		};

		addDoc(collection(db, 'files'), doc).then((res) => {
			console.log('uploaded file ', i, ' to dbs');
		});
	}
	return 0;
};

// returns a promise of a list of files that match the query
// or all files if query is empty
// TODO: chunk into groups of 50 results
export const getSearchResults = async (query: string) => {
	if (query === '') {
		return new Promise<any[]>((resolve, reject) => {
			getDocs(collection(db, 'files'))
				.then((snapshot) => {
					let results: object[] = [];
					snapshot.forEach((doc) => {
						// console.log(`${doc.id} => ${doc.data()}`);
						results.push({
							id: doc.id,
							name: doc.data().name,
							type: doc.data().type,
							url: doc.data().url,
							description: doc.data().description
						});
					});
					resolve(results);
				})
				.catch((err) => {
					console.log(err);
				});
		});
	} else {
		// return files that are semantically similar to query
		return new Promise<any[]>((resolve, reject) => {
			getDocs(collection(db, 'files'))
				.then(async (snapshot) => {
					let results: any[] = [];
					snapshot.forEach((doc) => {
						// console.log(`${doc.id} => ${doc.data()}`);
						results.push({
							id: doc.id,
							name: doc.data().name,
							type: doc.data().type,
							url: doc.data().url,
							description: doc.data().description
						});
					});

					// TODO: rank results
					let scores = await rankResults(query, results);
					console.log(scores);
					results.forEach((result, i) => {
						result.score = scores[i];
					});

					// sort results by score
					results.sort((a, b) => {
						return b.score - a.score;
					});

					resolve(results);
				})
				.catch((err) => {
					console.log(err);
				});
		});
	}
};

///////////////////// FUNCTIONS (HuggingFace)

// Text TO Embedding closeness model
const rankResults = async (query: string, results: any[]) => {
	let sentences: string[] = [];
	results.forEach((result) => {
		sentences.push(result.description);
	});

	console.log(query);
	console.log(sentences);

	return new Promise<number[]>((resolve, reject) => {
		hf.sentenceSimilarity({
			model: 'sentence-transformers/all-MiniLM-L6-v2',
			inputs: {
				source_sentence: query,
				sentences: sentences
			}
		})
			.then((scores) => {
				resolve(scores);
			})
			.catch((err) => {
				console.log(err);
			});
	});
};

// Text TO Summary model
const summarize = async (text: File) => {
	let desc: string = '';
	let input = await loadTextFile(text);
	let model: string = 'facebook/bart-large-cnn';
	// let model: string = 'csebuetnlp/mT5_multilingual_XLSum'; // <- another model to try

	await hf
		.summarization({
			model: model,
			inputs: input,
			parameters: {
				max_length: 50
			}
		})
		.then((res) => {
			desc = res.summary_text;
		});
	return desc;
};

// asynchronously load text file as string
const loadTextFile = async (file: File) => {
	let reader = new FileReader();
	return new Promise<string>((resolve, reject) => {
		reader.onerror = reject;
		reader.onload = () => {
			resolve(reader.result as string);
		};
		reader.readAsText(file);
	});
};

// Image TO Caption model
const captionImage = async (image: Blob) => {
	let desc: string = '';
	await hf
		.imageToText({
			data: image,
			model: 'nlpconnect/vit-gpt2-image-captioning'
		})
		.then((res) => {
			desc = res.generated_text;
		});

	return desc;
};
