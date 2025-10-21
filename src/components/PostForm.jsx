// src/pages/PostForm.jsx
import { useState, useRef } from "react";
import { useCreatePost } from "../lib/queries";

export default function PostForm() {
  const createPost = useCreatePost();
  const [author, setAuthor] = useState("阿聿");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const fileRef = useRef(null);        // ← 補上

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("author", author);
    fd.append("title", title);
    fd.append("content", content);
    if (image) fd.append("image", image);

    createPost.mutate(fd, {
      onSuccess: () => {
        setTitle(""); setContent(""); setImage(null);
        if (fileRef.current) fileRef.current.value = "";
      },
    });
  };

  return (
    <form onSubmit={submit} className="bg-white border rounded-xl shadow-sm p-4 mb-6">
      {/* ... */}
      <div className="mt-3 flex items-center gap-3">
        <input
          ref={fileRef}                           // ← 綁定
          type="file" accept="image/*"
          className="file-input file-input-bordered"
          onChange={(e)=>setImage(e.target.files?.[0] || null)}
        />
        <button className="btn btn-primary">發佈</button>
      </div>
    </form>
  );
}
