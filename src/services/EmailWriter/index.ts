import {BaseMemoryMessageType} from "yoov-llm-framework/@types/llm_messages";
import {prompt} from "../../prompts/email_writer"
import {LLMGenerator} from "yoov-llm-framework/dist/src/services/utils/LLMGenerator";
import {LLMResponse} from "yoov-llm-framework/dist/src/entities/LLMResponse";
import {UserInfoFetcher} from "../UserInfoFetcher";
import {extractBodyHtml, getGreetingEmailInstruction} from "./helpers";

export class EmailWriter {

    async write(instruction:string):Promise<string>{
        const messages:BaseMemoryMessageType[] = [
            {
                role:"system",
                content:prompt
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
        const llmResponse:LLMResponse = await llm.generate(messages, undefined, {
            temperature: 0.1,
        })

        return llmResponse.toString()
    }
}

async function main(){

    const data =
        {
            '名': 'Johnny',
            '姓': 'Lee',
            'First Name': 'Johnny',
            'Last Name': 'Lee',
            'Job Title': 'Chief Strategy Officer',
            'Email Address': 'johnnylee@yoov.com',
            'Company Name': 'YOOV Internet Technology (Asia) Limited',
            'Company Website': null,
            'Mobile Phone Number': '+852 5533 5533',
            'Office Phone Number': '+852 2877 1888',
            'Office Address 1': '26/F, COFCO Tower',
            'Office Address 2': '262 Gloucester Road',
            'Office Address 3': 'CWB, HK',
            non_text_elements: { logo_description: "A teal colored 'Y' on the top left corner." },
            notes: [
                'Multiple phone numbers are provided; one is identified as Hong Kong and the other as Malaysia.'
            ]
        }

        const userInfoFetcher = new UserInfoFetcher()

    const userInfo = await userInfoFetcher.fetch("sg204")

    const instruction = getGreetingEmailInstruction(userInfo, data)

    const writer = new EmailWriter()
    const response = await writer.write(instruction)
    console.log(response)

    const htmlContent = extractBodyHtml(response)

    console.log("htmlContent:", htmlContent)
}

main()