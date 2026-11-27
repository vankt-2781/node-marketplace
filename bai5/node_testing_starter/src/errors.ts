// errors.ts — các lớp lỗi vận hành, giữ nguyên từ topic Tổ chức code.
export class AppError extends Error {
  constructor(public status: number, public code: string,
    options?: ErrorOptions) {
    super(code, options);
    this.name = new.target.name;
  }
}
export class NotFoundError extends AppError {
  constructor(code: string) { super(404, code); }
}
export class ValidationError extends AppError {
  constructor(code: string) { super(400, code); }
}
