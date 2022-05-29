export class whatsapp_response_examples {
    text_recived = {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "101231222608969",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {
                        "display_phone_number": "15550141443",
                        "phone_number_id": "112506034798398"
                    },
                    "contacts": [{
                        "profile": {
                            "name": "Moustafa Mohsen"
                        },
                        "wa_id": "201027865531"
                    }],
                    "messages": [{
                        "from": "201027865531",
                        "id": "wamid.HBgMMjAxMDI3ODY1NTMxFQIAEhgUM0E4NzI4Mzc2N0M1MTM1REFGQ0YA",
                        "timestamp": "1653404048",
                        "text": {
                            "body": "J"
                        },
                        "type": "text"
                    }]
                },
                "field": "messages"
            }]
        }]
    }

    template_approved = {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "101231222608969",
            "time": 1653476744,
            "changes": [{
                "value": {
                    "event": "APPROVED",
                    "message_template_id": 1065352117696137,
                    "message_template_name": "confirm_product_with_image",
                    "message_template_language": "en_US",
                    "reason": "NONE"
                },
                "field": "message_template_status_update"
            }]
        }]
    }
}