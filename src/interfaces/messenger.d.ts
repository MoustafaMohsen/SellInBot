export interface MessengerBotConfigs{
    appID?: string
    appSecret?: string
    verifyToken?: string
    accessToken?: string

    accessToken?: string
    pageID?: string,
}

export interface sendMessage{
    page_id:string,
    user_id:string,
    message:string
}