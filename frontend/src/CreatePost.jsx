import React, { useEffect, useState } from "react";
import { createPost, updatePost, getPosts, getPostById } from "./api";
import { useParams, useNavigate, Link } from "react-router-dom";

const PLATFORM_CONFIG = {
  facebook: { label: "Facebook", badge: "f", classes: "bg-blue-600" },
  instagram: {
    label: "Instagram",
    badge: "IG",
    classes: "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600",
  },
  threads: { label: "Threads", badge: "@", classes: "bg-gray-900" },
  linkedin: { label: "LinkedIn", badge: "in", classes: "bg-sky-700" },
};

const ImageField = ({ id, label, file, existingUrl, onChange }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [file]);

  const displayUrl = preview || existingUrl;
  const fileName = file instanceof File ? file.name : null;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <label
        htmlFor={id}
        className="group relative flex flex-col items-center justify-center gap-2 w-full min-h-[9rem] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer overflow-hidden"
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt={`${label} preview`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition">
                Change image
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-400 py-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75m0 0L7.5 8.25M12 3.75v12"
              />
            </svg>
            <span className="text-sm">Click to upload</span>
          </div>
        )}
        <input
          id={id}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </label>
      {fileName && (
        <p className="mt-1 text-xs text-gray-500 truncate">Selected: {fileName}</p>
      )}
    </div>
  );
};

const CreatePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [serial, setSerial] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [verticalImage, setVerticalImage] = useState(null);
  const [horizontalImage, setHorizontalImage] = useState(null);
  const [platforms, setPlatforms] = useState({
    facebook: false,
    instagram: false,
    threads: false,
    linkedin: false,
  });
  const [comments, setComments] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (id) {
        setIsEdit(true);
        try {
          const post = await getPostById(id);
          setSerial(post.serial);
          setTitle(post.title);
          setDescription(post.description);
          setPlatforms(post.platform || {});
          setComments(post.comments || "");
          setVerticalImage(post.verticalImage);
          setHorizontalImage(post.horizontalImage);
        } catch (err) {
          console.error("Failed to load post:", err);
        }
      } else {
        try {
          const posts = await getPosts();
          const maxSerial = posts.reduce((max, post) => (post.serial > max ? post.serial : max), 0);
          setSerial(maxSerial + 1);
        } catch (err) {
          console.error("Failed to fetch posts:", err);
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, [id]);

  const handleCheckboxChange = (platform) => {
    setPlatforms((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("comments", comments);

    if (verticalImage instanceof File) {
      formData.append("verticalImage", verticalImage);
    }
    if (horizontalImage instanceof File) {
      formData.append("horizontalImage", horizontalImage);
    }

    Object.keys(platforms).forEach((key) => {
      formData.append(key, platforms[key]);
    });

    try {
      if (isEdit) {
        await updatePost(id, formData);
        alert("Post updated successfully!");
      } else {
        await createPost(formData);
        alert("Post created successfully!");
      }
      navigate("/posts");
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">
            <Link to="/posts" className="hover:text-blue-600 hover:underline">
              All Posts
            </Link>
            <span className="mx-1">/</span>
            {isEdit ? "Edit" : "Create"}
          </p>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Post" : "Create a New Post"}
          </h2>
        </div>
        <span className="shrink-0 inline-flex items-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1">
          #{serial}
        </span>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-400">
          Loading...
        </div>
      ) : (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
          {/* Basic details */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Basic Details
            </h3>

            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Diwali campaign teaser"
                className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this post about?"
                className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
            </div>
          </section>

          {/* Media */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Media
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageField
                id="verticalImage"
                label="Vertical Image"
                file={verticalImage instanceof File ? verticalImage : null}
                existingUrl={
                  typeof verticalImage === "string" ? `http://localhost:5000/${verticalImage}` : null
                }
                onChange={(e) => setVerticalImage(e.target.files[0])}
              />
              <ImageField
                id="horizontalImage"
                label="Horizontal Image"
                file={horizontalImage instanceof File ? horizontalImage : null}
                existingUrl={
                  typeof horizontalImage === "string" ? `http://localhost:5000/${horizontalImage}` : null
                }
                onChange={(e) => setHorizontalImage(e.target.files[0])}
              />
            </div>
          </section>

          {/* Platforms */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Platforms
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.keys(PLATFORM_CONFIG).map((platform) => {
                const { label, badge, classes } = PLATFORM_CONFIG[platform];
                const active = !!platforms[platform];
                return (
                  <button
                    type="button"
                    key={platform}
                    onClick={() => handleCheckboxChange(platform)}
                    aria-pressed={active}
                    className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border text-sm font-medium transition ${
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${classes}`}
                    >
                      {badge}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Comments */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Comments &amp; Feedback
            </h3>
            <textarea
              id="comments"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Internal notes, review feedback, etc."
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <Link
              to="/posts"
              className="px-4 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isSubmitting && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {isSubmitting ? "Saving..." : isEdit ? "Update Post" : "Submit Post"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreatePost;
