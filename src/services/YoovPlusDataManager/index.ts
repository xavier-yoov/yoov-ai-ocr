import axios, {AxiosInstance} from "axios";

export type EmailRecord = {
    subject: string,
    html: string,
    text?: string,
    sender_name: string,
    sender_email: string,
    recipient_name?: string,
    recipient_email: string,
}
export class YoovPlusDataManager{

    private readonly base_url = 'https://api.yoov.plus/worksheet/api/v1/open'

    private readonly client:AxiosInstance

    constructor(private readonly credentials:{
        app_key:string,
        app_sign:string,
        worksheet_id:string
                }) {

        this.client = axios.create({
            baseURL: this.base_url,
            headers: {
                'Content-Type': 'application/json',
                'X-APP-KEY': credentials.app_key,
                'X-APP-SIGN ': credentials.app_sign,
            }
        })
    }

    addRecord(record:EmailRecord){
        const fields = {
            '675d37046061e476ebf763da': record.subject,
            '675d374e6061e476ebf763e0': record.recipient_email,
            '675d38306061e476ebf763e3': record.sender_email,
            '675d38306061e476ebf763e4': record.sender_name ?? "",
            '675d37046061e476ebf763db': record.html,
            '675d37308bad043242d9bc33': record.text ?? "",
        }
        return this.client.post(`/worksheets/${this.credentials.worksheet_id}/records`, {fields})
            .catch((e) => {
                console.error(e)
                throw e
            })
    }
}

// async function main() {
//     const dataManager = new YoovPlusDataManager({
//         app_key: "f188e454c4d54635b5c9e3bace8390a0",
//         app_sign: "NTVkNTZlMWI1ZDMwZDZhZWIxMTRjOWYzYmViOWViYTk2MDc2NzA4Mjg4YjNmZWVhY2EwMzlhYjMwYjk4NDNjNQ==",
//         worksheet_id: "675d37046061e476ebf763d8"
//     })
//
//     const emailRecord = {
//         subject: "Greeting from YOOV",
//         html: "<h1>Hello</h1>",
//         sender_name: "John Doe",
//         sender_email: "jdoe@yoov.com",
//         recipient_email: "xavierau@yoov.com",
//     }
//
//     dataManager.addRecord(emailRecord)
//         .then((response) => {
//             console.log("response", response.data);
//         })
//         .catch(error => {
//             console.log("error", error);
//         })
// }
//
// main()