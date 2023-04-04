## OpenAI Elasticsearch EQL Assistant

This is a Node.js script that uses OpenAI's GPT-3 language model to generate an Elasticsearch query based on a user's input question. The script prompts the user to provide the file path for an Elasticsearch Common Schema (ECS) YAML file, then prompts the user for a query. It uses the GPT-3 model to generate a corresponding Elasticsearch query and runs it against an Elasticsearch cluster, returning the number of hits.


https://user-images.githubusercontent.com/53792284/229661059-f7f0b313-cc78-4def-8f3d-7537d9cfc2c8.mov


### Prerequisites

To use this script, you will need:

- Node.js version 12 or higher
- An OpenAI API key
- An Elasticsearch instance

### Setup

1. Clone this repository and navigate to the project directory in a terminal window.
2. Install the dependencies by running `npm install`.
3. Set the following environment variables:

- OPENAI_API_KEY= your OpenAI API key
- ELASTICSEARCH_URL= your Elasticsearch URL
- ES_USER= your Elasticsearch username
- ES_PWD= your Elasticsearch password

### Usage

To run the script, run `node index.js` in your terminal window. The script will prompt you to provide the file path for an Elasticsearch Common Schema (ECS) YAML file. Once you've provided the file path, the script will prompt you to provide a query.

The GPT-3 model will generate an Elasticsearch query based on your input question and the ECS schema you provided. The script will then run the query against your Elasticsearch instance and return the number of hits.

To exit the script, press `CTRL+C`.
