// src/router.jsx
import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Map from "./pages/Map.jsx";
import Care from "./pages/Care.jsx";
import FeedPage from "./pages/FeedPage";
import PostDetail from "./pages/PostDetail";
import Report from "./pages/Report.jsx";
import Layout from "./pages/Layout.jsx";
import AnimalDetail from "./pages/AnimalDetail.jsx";
import AdoptList from "./pages/AdoptList";
import AdoptConfirm from "./pages/AdoptConfirm.jsx";
import Login from "./pages/Login.jsx";
import Signin from "./pages/Signin.jsx";
import AuthPage from "./pages/Auth.jsx";
import SponsorList from "./pages/SponsorList.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import MyComments from "./pages/MyComments.jsx";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/map", element: <Map /> },
      { path: "/care", element: <Care /> },
      { path: "/feed", element: <FeedPage /> },

      // ✅ 正式文章詳情路由：統一使用 /posts/:id
      { path: "/posts/:id", element: <PostDetail /> },

      // ✅ 兼容舊路徑：避免社群頁面還在用舊網址導致 404
      { path: "/post/:id", element: <Navigate to="/posts/:id" replace /> },
      { path: "/feed/:id", element: <Navigate to="/posts/:id" replace /> },

      { path: "/report", element: <Report /> },
      { path: "/report/:id", element: <AnimalDetail /> },

      { path: "/adoptlist", element: <AdoptList /> },
      { path: "/Adoptconfirm/:id", element: <AdoptConfirm /> },

      { path: "/login", element: <Login /> },
      { path: "/signin", element: <Signin /> },
      { path: "/auth", element: <AuthPage /> },

      { path: "/sponsorlist", element: <SponsorList /> },
      { path: "/myposts", element: <MyPosts /> },
      { path: "/mycomments", element: <MyComments /> },

      // ✅ 兜底：任何未知路由導回 /feed（可改成你的 NotFound 頁）
      { path: "*", element: <Navigate to="/feed" replace /> },
    ],
  },
]);
