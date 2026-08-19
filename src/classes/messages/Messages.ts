export class GenericMessage
{
    public message: string = "";
    public timeStamp: number = 0;

    constructor(message: string, timeStamp: number)
    {
        this.message = message;
        this.timeStamp = timeStamp;
    }
}