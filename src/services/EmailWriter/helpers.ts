import {UserInfo} from "../UserInfoFetcher";

export function getGreetingEmailInstruction(senderInfo:UserInfo, recipientData:any):string{

    return `Please write a greeting email on behalf of the following user:
    User name: ${senderInfo.FirstName} ${senderInfo.LastName}
    Company Name: ${senderInfo.Company}
    Phone Number: ${senderInfo.Phone}
    Email Address: ${senderInfo.Email}
    Job Title: ${senderInfo.Title}
    Extra Information: ${senderInfo.Message}
         
    To the following recipient:
    Recipient First Name: ${recipientData["First Name"]}
    Recipient Last Name: ${recipientData["Last Name"]}
    Recipient Company Name: ${recipientData["Company Name"]}
    Recipient Job Title: ${recipientData["Job Title"]}
    
    The sender have just exchange business card with the recipient at a offline meetup. The email intend to establish a business relationship.
    `

}

export function extractBodyHtml(html:string){
    // Regular expression to extract the content inside the <body> tag
    const bodyRegex = /<\s*body[^>]*>([\s\S]*?)<\s*\/\s*body\s*>/;

// Extract the content
    const match = html.match(bodyRegex);
    if (!match) {
        console.error("No <body> tag found.");
        return null
    }
    const bodyContent = match[1];
    console.log(bodyContent);
    return bodyContent
}