from flask import Flask, request, jsonify
import openai
import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext
from llama_index.core.llms import LLMMetadata

# Set your OpenAI API key
os.environ["OPENAI_API_KEY"] = "sk-proj-Jp1qgtX055bv9DnW8BN6T3BlbkFJV0kfbFPm4LJGWFHPgysq"
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize the Flask app
app = Flask(__name__)

# Custom LLM predictor class
class CustomOpenAIPredictor:
    def __init__(self, gpt_model):
        self.gpt_model = gpt_model

    def complete(self, prompt, **kwargs):
        try:
            response = openai.Completion.create(
                engine=self.gpt_model,
                prompt=prompt,
                max_tokens=kwargs.get("max_tokens", 150),
                temperature=kwargs.get("temperature", 0.7),
                n=kwargs.get("n", 1),
                stop=kwargs.get("stop", None),
            )
            return response.choices[0].text.strip()
        except openai.error.RateLimitError as e:
            return f"Error: {e.error['message']}"

    async def acomplete(self, prompt, **kwargs):
        return self.complete(prompt, **kwargs)

    def stream_complete(self, prompt, **kwargs):
        raise NotImplementedError("stream_complete is not implemented")

    async def astream_complete(self, prompt, **kwargs):
        raise NotImplementedError("astream_complete is not implemented")

    def chat(self, messages, **kwargs):
        raise NotImplementedError("chat is not implemented")

    async def achat(self, messages, **kwargs):
        raise NotImplementedError("achat is not implemented")

    def stream_chat(self, messages, **kwargs):
        raise NotImplementedError("stream_chat is not implemented")

    async def astream_chat(self, messages, **kwargs):
        raise NotImplementedError("astream_chat is not implemented")

    def metadata(self):
        return LLMMetadata(
            model_name=self.gpt_model,
            description="Custom LLM predictor using OpenAI API",
            max_tokens=2048
        )

# Endpoint to query the LLM
@app.route('/api/query', methods=['POST'])
def query_endpoint():
    data = request.json
    query = data.get('query')
    if not query:
        return jsonify({'error': 'Missing query parameter'}), 400
    
    # List of PDF files (assuming user saves files in the 'docs' directory)
    pdf_files = [f'docs/{file}' for file in os.listdir('docs') if file.endswith('.pdf')]

    # Load data from PDFs
    docs = SimpleDirectoryReader(input_files=pdf_files).load_data()

    # Choose the GPT model
    gpt_model = "gpt-4"  # or "gpt-3.5-turbo" or "text-davinci-003"

    # Initialize the custom LLM predictor
    custom_llm = CustomOpenAIPredictor(gpt_model=gpt_model)

    # Initialize the StorageContext
    storage_context = StorageContext.from_defaults()

    # Create the index using the custom LLM predictor and storage context
    index = VectorStoreIndex.from_documents(docs, llm_predictor=custom_llm, storage_context=storage_context)

    # Create the query engine from the index
    query_engine = index.as_query_engine()

    try:
        answer = query_engine.query(query)
        return jsonify({
            'query': query,
            'answer': str(answer),
            'sources': answer.get_formatted_sources()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)



# from flask import Flask, request, jsonify
# import openai
# import os
# import json
# from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext
# from llama_index.core.llms import LLMMetadata
# import pickle

# # Set your OpenAI API key
# os.environ["OPENAI_API_KEY"] = "sk-proj-9L4FCITarhMJ55tP4cUzT3BlbkFJVAEpIGf0Xd3Xp7ekUcER"
# openai.api_key = os.getenv("OPENAI_API_KEY")

# # Initialize the Flask app
# app = Flask(__name__)

# # Directory where uploaded documents are stored (handled by Node.js)
# UPLOAD_DIR = "docs"
# RAG_DATA_DIR = "rag_data"

# # Ensure RAG data directory exists
# os.makedirs(RAG_DATA_DIR, exist_ok=True)

# # Custom LLM predictor class
# class CustomOpenAIPredictor:
#     def __init__(self, gpt_model):
#         self.gpt_model = gpt_model

#     def complete(self, prompt, **kwargs):
#         try:
#             response = openai.Completion.create(
#                 engine=self.gpt_model,
#                 prompt=prompt,
#                 max_tokens=kwargs.get("max_tokens", 150),
#                 temperature=kwargs.get("temperature", 0.7),
#                 n=kwargs.get("n", 1),
#                 stop=kwargs.get("stop", None),
#             )
#             return response.choices[0].text.strip()
#         except openai.error.RateLimitError as e:
#             return f"Error: {e.error['message']}"

#     async def acomplete(self, prompt, **kwargs):
#         return self.complete(prompt, **kwargs)

#     def stream_complete(self, prompt, **kwargs):
#         raise NotImplementedError("stream_complete is not implemented")

#     async def astream_complete(self, prompt, **kwargs):
#         raise NotImplementedError("astream_complete is not implemented")

#     def chat(self, messages, **kwargs):
#         raise NotImplementedError("chat is not implemented")

#     async def achat(self, messages, **kwargs):
#         raise NotImplementedError("achat is not implemented")

#     def stream_chat(self, messages, **kwargs):
#         raise NotImplementedError("stream_chat is not implemented")

#     async def astream_chat(self, messages, **kwargs):
#         raise NotImplementedError("astream_chat is not implemented")

#     def metadata(self):
#         return LLMMetadata(
#             model_name=self.gpt_model,
#             description="Custom LLM predictor using OpenAI API",
#             max_tokens=2048
#         )

# # Helper function to save index to a file
# def save_index(index, file_path):
#     with open(file_path, 'wb') as f:  # Open in binary mode for pickle
#         pickle.dump(index, f)

# # Helper function to load index from a file
# def load_index(file_path):
#     with open(file_path, 'rb') as f:  # Open in binary mode for pickle
#         return pickle.load(f)

# # Endpoint to upload and process the document
# @app.route('/api/upload', methods=['POST'])
# def upload_endpoint():
#     # List all PDF files in the UPLOAD_DIR
#     pdf_files = [os.path.join(UPLOAD_DIR, file) for file in os.listdir(UPLOAD_DIR) if file.endswith('.pdf')]

#     if not pdf_files:
#         return jsonify({'error': 'No PDF files found in UPLOAD_DIR'}), 404

#     # Load data from all PDFs
#     docs = SimpleDirectoryReader(input_files=pdf_files).load_data()

#     # Choose the GPT model
#     gpt_model = "gpt-4"  # or "gpt-3.5-turbo" or "text-davinci-003"

#     # Initialize the custom LLM predictor
#     custom_llm = CustomOpenAIPredictor(gpt_model=gpt_model)

#     # Serialize the index
#     for file_path in pdf_files:
#         filename = os.path.basename(file_path)
#         rag_file_path = os.path.join(RAG_DATA_DIR, f"{filename}.pickle")
#         index = {
#             'docs': [doc.text for doc in docs],  # Extracting text from documents
#             'llm_metadata': custom_llm.metadata()
#         }
#         save_index(index, rag_file_path)

#     return jsonify({'message': 'Documents processed and RAG knowledge saved successfully.'}), 200

# # Endpoint to query the LLM with stored RAG knowledge
# @app.route('/api/query', methods=['POST'])
# def query_endpoint():
#     data = request.json
#     query = data.get('query')
#     filename = data.get('filename')

#     try:
#         if not query:
#             return jsonify({'error': 'Missing query parameter'}), 400

#         # Load the RAG knowledge
#         if filename:
#             rag_file_path = os.path.join(RAG_DATA_DIR, f"{filename}.pickle")
#             if not os.path.exists(rag_file_path):
#                 return jsonify({'error': 'RAG knowledge for the document not found.'}), 404
#             # Load index data from the file
#             with open(rag_file_path, 'rb') as f:
#                 index_data = pickle.load(f)
#         else:
#             # If filename is not provided, load all RAG knowledge files
#             rag_files = [os.path.join(RAG_DATA_DIR, f) for f in os.listdir(RAG_DATA_DIR) if f.endswith('.pickle')]
#             if not rag_files:
#                 return jsonify({'error': 'No RAG knowledge files found.'}), 404
#             # Load all RAG knowledge files
#             index_data = {}
#             for file_path in rag_files:
#                 with open(file_path, 'rb') as f:
#                     index_data.update(pickle.load(f))
            
#         custom_llm = CustomOpenAIPredictor(gpt_model="gpt-4")

#         # Reconstruct the index
#         index_docs = index_data.get('docs', [])
#         index_metadata = index_data.get('llm_metadata', {})
        
#         # Create the index object
#         index = {
#             'docs': index_docs,
#             'llm_predictor': custom_llm,
#             'llm_metadata': index_metadata
#         }

#         # Query the entire RAG knowledge
#         max_tokens = index['llm_metadata'].max_tokens if hasattr(index['llm_metadata'], 'max_tokens') else 2048
#         answer = index['llm_predictor'].complete(query, max_tokens=max_tokens)
        
#         # Get formatted sources
#         sources = answer.get_formatted_sources()
        
#         return jsonify({
#             'query': query,
#             'answer': answer,
#             'sources': sources  # Include the formatted sources
#         })
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500


# if __name__ == '__main__':
#     app.run(debug=True)
