import { findPostCallback } from "./services.js";

findPostCallback("p1", (err, post) => {
  if (err) throw err;
  console.log(post!.title);
});
