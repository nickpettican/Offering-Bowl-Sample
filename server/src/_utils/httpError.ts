class HttpError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

export class UnauthorizedError extends Error {
    status: number;

    constructor(message: string) {
        super(message);
        this.status = 401;
    }
}

export class ForbiddenError extends Error {
    status: number;

    constructor(message: string) {
        super(message);
        this.status = 403;
    }
}

export class NotFoundError extends Error {
    status: number;

    constructor(message: string) {
        super(message);
        this.status = 404;
    }
}

export class UnprocessableEntityError extends Error {
    status: number;

    constructor(message: string) {
        super(message);
        this.status = 422;
    }
}

export default HttpError;
