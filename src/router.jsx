import React from "react";
import { createBrowserRouter } from "react-router-dom";
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

// 1. 建立一個簡單的延遲函式（你目前沒用到，可留著）
const delayLoader = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return null;
};

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/map", element: <Map /> },
      { path: "/care", element: <Care /> },
      { path: "/feed", element: <FeedPage /> },

      // ✅ 修正：文章詳情路由統一使用 /posts/:id
      { path: "/posts/:id", element: <PostDetail /> },

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
    ],
  },
]);
