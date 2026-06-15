//all of this because status error is unknown type so we mad enew class with a specific type to it 

export interface IError extends Error {
    statusCode: number
}

export class ApplicationError extends Error {
    constructor(msg: string, public statusCode: number, options: ErrorOptions = {}) {
        super(msg, options)
    }
}

export class NotFoundException extends ApplicationError {
    constructor(msg:string="Not found"){
       super(msg ,404) 
    }
}
export class InvalidTokenException extends ApplicationError {
    constructor(msg:string="invalid token !"){
       super(msg ,404) 
    }
}
export class InvalidOtpException extends ApplicationError {
    constructor(msg:string="invalid otp !"){
       super(msg ,404) 
    }
}
export class NotVerfiedException extends ApplicationError {
    constructor(msg:string="Not verfied email !"){
       super(msg ,404) 
    }
}