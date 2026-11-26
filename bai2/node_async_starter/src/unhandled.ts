import { getReviewCount } from "./services.js";

getReviewCount("u3"); // không await, không catch
console.log("dòng phía sau vẫn chạy");
