export interface MessengerBotConfigs{
    appID?: string
    appSecret?: string
    validationToken?: string

    pageToken?: string
    pageID?: string,
}

export interface sendMessage{
    page_id:string,
    user_id:string,
    message:string
}