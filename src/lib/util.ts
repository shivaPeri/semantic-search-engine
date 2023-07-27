import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { HfInference, HfInferenceEndpoint } from '@huggingface/inference';

const config = {
  apiKey: "AIzaSyDZNfxtUg1J47Aj10GQXBWwY-cNxTkg15M",
  authDomain: "semantic-search-engine-ef68e.firebaseapp.com",
  projectId: "semantic-search-engine-ef68e",
  storageBucket: "semantic-search-engine-ef68e.appspot.com",
  messagingSenderId: "825183710628",
  appId: "1:825183710628:web:070453f999b1331df62531"
};

// Initialize Firebase
const app = initializeApp(config);

// initialize Database
export const db = getFirestore();

// initialize Authentication (only for users who want to upload files)
export const auth = getAuth();
export const provider = new GoogleAuthProvider();

// initialize HuggingFace Inference API
const hf = new HfInference('your access token')


/////////////////////

export const uploadFiles = (files: FileList) => {
    
    console.log(files)
    // for ()
}


// Text TO Summary model
const summarize = async (text: string) => {

    // "csebuetnlp/mT5_multilingual_XLSum" // <- another model to try
    // await hf.summarization({
    //     model: 'facebook/bart-large-cnn',
    //     inputs:
    //       'The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930.',
    //     parameters: {
    //       max_length: 100
    //     }
    // })
}



// Text TO Embedding closeness model

const rankResults = async () => {
    // do something
    await hf
      .sentenceSimilarity({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: {
          source_sentence: "That is a happy person",
          sentences: [
            "That is a happy dog",
            "That is a very happy person",
            "Today is a sunny day",
          ],
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };


// Image TO Caption model
const captionImage = async () => {
    // "nlpconnect/vit-gpt2-image-captioning"
    // await hf.imageToText({
    //     data: readFileSync('test/cats.png'),
    //     model: 'nlpconnect/vit-gpt2-image-captioning'
    // })
}



export const search = (query: string) => {

    // look up query in Firestore
    const colRef = collection(db, 'indexed-files');

    // collect all documents and extract their embeddings
    getDocs(colRef).then((snapshot) => {
        console.log(snapshot.docs);

        // collect embeddings

        // call inference endpoint

        // return results
    }).catch()
}