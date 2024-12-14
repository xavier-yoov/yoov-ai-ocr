export type UserInfo = {
    FirstName?: string,
    LastName?: string,
    Email?: string,
    Phone?: string,
    Title?: string,
    Company?: string,
    Message?: string,
}

export class UserInfoFetcher{
    fetch(userId: string): Promise<UserInfo>{
       // if(userId !== "sg204"){
       // throw  new Error("User not found")
       // }
         return Promise.resolve({
             FirstName: "Johnny",
             LastName: "Lee",
             Email: "johnnylee@yoov.com",
             Company: "YOOV Internet Technology (Asia) Limited",
             Phone: "852-5533 5533 (HK) / 60-13388 5533 (MY)",
             Title: "Chief Strategy Officer",
             Message: "YOOV has office in Hong Kong • Singapore • Malaysia • Australia • Taiwan"
            })
         }
}