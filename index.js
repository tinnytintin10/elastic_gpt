const readline = require('readline');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs/promises');
const { Client } = require('@elastic/elasticsearch');

const requiredEnvVars = ['OPENAI_API_KEY', 'ELASTICSEARCH_URL', 'ES_USER', 'ES_PWD'];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`Please set the ${envVar} environment variable.`);
        process.exit(1);
    }
});

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const elasticClient = new Client({
    node: process.env.ELASTICSEARCH_URL,
    auth: { username: process.env.ES_USER, password: process.env.ES_PWD },
});

async function promptForSchemaPath() {
    try {
        const schemaPath = await askQuestionAsync('Schema file path > ');
        const schemaContent = await fs.readFile(schemaPath, 'utf8');
        await promptAndProcessInput(schemaContent);
    } catch (error) {
        console.error('An error occurred while reading the schema file:', error.message);
        await promptForSchemaPath();
    }
}

async function promptAndProcessInput(schemaContent) {
    try {
        const userInput = await askQuestionAsync('Query > ');
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `You are a Elastic Event Query Language (EQL) assistant specialized in translating questions into EQL statements using the Elastic Common Schema (ECS) fields. Please consider the ECS schema provided in YAML format below and generate a EQL statement as a single string for the following question. You must respond ONLY with EQL, nothing else. Don't provide any filler content, just respond with ONLY an EQL string. Use only fields present in the ECS and respond exclusively with the resulting EQL string. 
                Schema: 
                ${schemaContent} 
                Question: ${userInput}`,
            temperature: 1.0,
            max_tokens: 200,
            n: 1,
            stop: null,
        });

        const eqlStatement = response?.data?.choices?.[0]?.text?.trim();
        if (!eqlStatement) {
            console.error('❌ No EQL statement found in the response from OpenAI');
            return promptAndProcessInput(schemaContent);
        }
        console.log();
        console.log('✅ The EQL Query for what you\'re looking for is:');
        console.log();
        console.log(eqlStatement);
        console.log();
        console.log('🔍 Searching Elasticsearch');
        console.log();

        try {
            const searchResponse = await elasticClient.search({
                index: 'logs-*',
                body: { query: { query_string: { query: eqlStatement } } },
            });

            console.log('✅ Number of hits:', searchResponse.hits.total.value);
            console.log();
        } catch (error) {
            console.error('❌ An error occurred while searching Elasticsearch:', error.message);
        }
    } catch (error) {
        console.error('❌ An error occurred while processing the input:', error.message);
    }

    await promptAndProcessInput(schemaContent);
}

async function askQuestionAsync(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

(async () => {
    try {
        await promptForSchemaPath();
    } catch
    (error) {
        console.error('❌ An error occurred:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
})();