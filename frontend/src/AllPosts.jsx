import React, { useEffect, useState } from "react";
import { createPost, updatePost, getPosts, getPostById, deletePost } from "./api";
import axios from "axios";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

const getBase64FromUrl = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const PLATFORM_CONFIG = {
  facebook: { label: "Facebook", badge: "f", classes: "bg-blue-600" },
  instagram: {
    label: "Instagram",
    badge: "IG",
    classes: "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600",
  },
  linkedin: { label: "LinkedIn", badge: "in", classes: "bg-sky-700" },
  threads: { label: "Threads", badge: "@", classes: "bg-gray-900" },
};

const ImageCell = ({ src, alt }) => {
  if (!src) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <div className="flex flex-col items-center gap-1">
      <img
        src={src}
        alt={alt}
        className="h-16 w-16 object-cover rounded-md border border-gray-200"
      />
      <a
        href={src}
        download
        title={`Download ${alt}`}
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3.75m0 0L16.5 7.5M12 3.75v12" />
        </svg>
        Download
      </a>
    </div>
  );
};

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(id);
        setPosts(posts.filter((post) => post._id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToExcelWithImages = async (posts) => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Posts");

      // Define headers
      worksheet.columns = [
        { header: "Serial", key: "serial", width: 10 },
        { header: "Title", key: "title", width: 30 },
        { header: "Description", key: "description", width: 40 },
        { header: "Platforms", key: "platforms", width: 20 },
        { header: "Vertical Image", key: "verticalImage", width: 20 },
        { header: "Horizontal Image", key: "horizontalImage", width: 20 },
        { header: "Comments", key: "comments", width: 40 },
      ];

      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];

        const rowIndex = i + 2;

        worksheet.addRow({
          serial: post.serial,
          title: post.title,
          description: post.description,
          platforms: Object.entries(post.platform)
            .filter(([_, val]) => val)
            .map(([key]) => key)
            .join(", "),
          verticalImage: "",
          horizontalImage: "",
          comments: post.comments,
        });

        // Add images if they exist
        if (post.verticalImage) {
          const base64 = await getBase64FromUrl(post.verticalImage);
          const imageId = workbook.addImage({
            base64: base64,
            extension: "jpeg",
          });
          worksheet.addImage(imageId, {
            tl: { col: 4, row: rowIndex - 1 },
            ext: { width: 80, height: 80 },
          });
        }

        if (post.horizontalImage) {
          const base64 = await getBase64FromUrl(post.horizontalImage);
          const imageId = workbook.addImage({
            base64: base64,
            extension: "jpeg",
          });
          worksheet.addImage(imageId, {
            tl: { col: 5, row: rowIndex - 1 },
            ext: { width: 80, height: 80 },
          });
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "AllPosts.xlsx");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Posts</h1>
          <p className="text-sm text-gray-500">
            {posts.length} post{posts.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          to="/CreatePosts"
          className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + New Post
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <div className="relative w-full sm:w-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title..."
            className="border border-gray-300 pl-9 pr-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => exportToExcelWithImages(posts)}
          disabled={isExporting || posts.length === 0}
          className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isExporting ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75m0 0L7.5 8.25M12 3.75v12" />
            </svg>
          )}
          {isExporting ? "Exporting..." : "Export to Excel"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Serial</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Title</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Description</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Vertical Image</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Horizontal Image</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Platforms</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Comments</th>
                <th className="px-3 py-2.5 text-center font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-400">
                    Loading posts...
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50 align-top">
                    <td className="px-3 py-3 text-gray-500 font-medium">#{post.serial}</td>
                    <td className="px-3 py-3 font-medium text-gray-900 max-w-[12rem] break-words">
                      {post.title}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-pre-wrap break-words max-w-xs">
                      {post.description}
                    </td>
                    <td className="px-3 py-3">
                      <ImageCell
                        src={post.verticalImage ? `http://localhost:5000/uploads/${post.verticalImage}` : null}
                        alt="Vertical"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <ImageCell
                        src={post.horizontalImage ? `http://localhost:5000/uploads/${post.horizontalImage}` : null}
                        alt="Horizontal"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.keys(PLATFORM_CONFIG).map((key) => {
                          if (!post.platform?.[key]) return null;
                          const { label, badge, classes } = PLATFORM_CONFIG[key];
                          return (
                            <span
                              key={key}
                              title={label}
                              className={`w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center ${classes}`}
                            >
                              {badge}
                            </span>
                          );
                        })}
                        {!Object.keys(PLATFORM_CONFIG).some((key) => post.platform?.[key]) && (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-pre-wrap break-words max-w-xs">
                      {post.comments}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/edit/${post._id}`}
                          title="Edit"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(post._id)}
                          title="Delete"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!isLoading && filteredPosts.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-400">
                    No posts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllPosts;
