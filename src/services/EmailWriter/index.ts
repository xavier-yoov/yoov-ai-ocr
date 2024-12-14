import {BaseMemoryMessageType} from "yoov-llm-framework/@types/llm_messages";
import {prompt} from "../../prompts/email_writer"
import {LLMGenerator} from "yoov-llm-framework/dist/src/services/utils/LLMGenerator";
import {LLMResponse} from "yoov-llm-framework/dist/src/entities/LLMResponse";


export class EmailWriter {

    async write(instruction:string):Promise<string>{
        const messages:BaseMemoryMessageType[] = [
            {
                role:"system",
                content:instruction
            },
            {
                role:"user",
                content:instruction
            },
            {
                role:"user",
                content:"Please give the email in HTML format.\noutput:"
            }
        ]

        const llm = LLMGenerator.make("azure-gpt-4o")
        const llmResponse:LLMResponse = await llm.generate(messages)

        return llmResponse.toString()
    }
}

// async function main(){
//     const writer = new EmailWriter()
//     const instruction = `Please write a greeting email to John Doe at TechSolutions Inc. with the job title Marketing Director on behalf of John Doe at YOOV Internet Technology (Asia) Limited, johnnylee@yoov.com, 852-5533 5533 (HK) / 60-13388 5533 (MY), 26/F, COFCO Tower, 262 Gloucester Road, CWB, HK. YOOV has office in Hong Kong • Singapore • Malaysia • Australia • Taiwan`
//     const response = await writer.write(instruction)
//     console.log(response)
//
//     // Regular expression to extract the content inside the <body> tag
//     const bodyRegex = /<\s*body[^>]*>([\s\S]*?)<\s*\/\s*body\s*>/;
//
// // Extract the content
//     const match = response.match(bodyRegex);
//     if (match) {
//         const bodyContent = match[1];
//         console.log(bodyContent);
//     } else {
//         console.log("No <body> tag found.");
//     }
// }
//
// main()