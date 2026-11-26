// Lỗi nghiệp vụ có mã trạng thái HTTP và mã lỗi gửi về cho client.
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(code: string) {
    super(404, code);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(code: string) {
    super(400, code);
    this.name = 'ValidationError';
  }
}
