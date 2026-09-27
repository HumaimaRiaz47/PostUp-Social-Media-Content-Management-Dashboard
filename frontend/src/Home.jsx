import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "./api";

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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getDisplayName = (email) => {
  if (!email) return "";
  const namePart = email.split("@")[0] || "";
  return namePart
    .replace(/[._]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
};

const StatCard = ({ label, value, accent }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${accent}`}>
      {value}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const Home = () => {
  const email = useMemo(() => localStorage.getItem("user") || "", []);
  const displayName = useMemo(() => getDisplayName(email), [email]);

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const platformCounts = useMemo(() => {
    const counts = { facebook: 0, instagram: 0, linkedin: 0, threads: 0 };
    posts.forEach((post) => {
      Object.keys(counts).forEach((key) => {
        if (post.platform?.[key]) counts[key] += 1;
      });
    });
    return counts;
  }, [posts]);

  const recentPosts = useMemo(
    () =>
      [...posts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [posts]
  );

  return (
    <div className="py-10 px-4 max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="text-center mb-10">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-700 mb-3">
          {getGreeting()}
          {displayName ? `, ${displayName}` : ""} 👋
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Welcome back to PostUp — your social media management hub. Create posts,
          track submissions, and keep your content organized.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            to="/CreatePosts"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
          >
            + Create Post
          </Link>
          <Link
            to="/posts"
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
          >
            View All Posts
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
        <StatCard label="Total Posts" value={isLoading ? "…" : posts.length} accent="bg-blue-600" />
        {Object.keys(PLATFORM_CONFIG).map((key) => (
          <StatCard
            key={key}
            label={PLATFORM_CONFIG[key].label}
            value={isLoading ? "…" : platformCounts[key]}
            accent={PLATFORM_CONFIG[key].classes}
          />
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Recent Posts
          </h3>
          <Link to="/posts" className="text-sm text-blue-600 hover:underline font-medium">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-sm py-6 text-center">Loading recent posts...</p>
        ) : recentPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-3">You haven't created any posts yet.</p>
            <Link
              to="/CreatePosts"
              className="inline-flex items-center gap-1.5 text-blue-600 font-medium hover:underline"
            >
              Create your first post →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentPosts.map((post) => (
              <li key={post._id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    #{post.serial} · {post.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
