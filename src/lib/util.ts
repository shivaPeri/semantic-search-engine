import { initializeApp } from 'firebase/app';
import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
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

// const hf_key = process.env.PRIVATE_HF_ACCESS_TOKEN;
const hf_key = import.meta.env.VITE_HF_ACCESS_TOKEN;
console.log(hf_key);
// const hf_key = '';

// initialize HuggingFace Inference API
const hf = new HfInference(hf_key);

///////////////////// FUNCTIONS

export const uploadFiles = async (files: FileList) => {
	console.log(files);
	for (let i = 0; i < files.length; i++) {
		let file = files.item(i);
		if (file === null) {
			continue;
		}
		console.log(file);

		// upload file to storage
		let storageRef = ref(storage, file.name);
		await uploadBytes(storageRef, file).then((snapshot) => {
			console.log('Uploaded a blob or file!', snapshot);
		});

		if (file.type.includes('image')) {
			// caption image
			let desc: string = await captionImage(file);
			add2db(file, desc);
		}

		if (file.type.includes('text')) {
			// summarize text
			let desc = await summarize(file);
			add2db(file, desc);
		}
	}
};

const add2db = async (file: File, desc: string) => {
	addDoc(collection(db, 'files'), {
		name: file.name,
		description: desc
	}).then((res) => {
		console.log('uploaded to dbs');
	});
};

// export const onStorageChanged = functions.storage.object().onFinalize(async (object) => {
// 	const fileBucket = object.bucket; // The Storage bucket that contains the file.
// 	const filePath = object.name; // File path in the bucket.
// 	const contentType = object.contentType; // File content type.

// 	console.log('file uploaded to storage');
// 	console.log(fileBucket);
// 	console.log(filePath);
// 	console.log(contentType);
// });

export const getSearchResults = (query: string) => {
	// if (query === '') {
	// 	// return all files
	// 	listAll(filesRef)
	// 		.then((res) => {
	// 			res.items.forEach((itemRef) => {
	// 				console.log(itemRef.name);
	// 			});
	// 		})
	// 		.catch((err) => {
	// 			console.log(err);
	// 		});
	// } else {
	// 	// return files that are semantically similar to query
	// }
};

// Text TO Embedding closeness model

const rankResults = async () => {
	// do something
	await hf
		.sentenceSimilarity({
			model: 'sentence-transformers/all-MiniLM-L6-v2',
			inputs: {
				source_sentence: 'That is a happy person',
				sentences: ['That is a happy dog', 'That is a very happy person', 'Today is a sunny day']
			}
		})
		.then((res) => {
			console.log(res);
		})
		.catch((err) => {
			console.log(err);
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
