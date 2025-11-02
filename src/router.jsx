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

export const router = createBrowserRouter([
  {
    element: <Layout />, 
    children: [
      { path: "/", element: <Home /> },
      { path: "/map", element: <Map /> },
      { path: "/care", element: <Care /> },
      { path: "/feed", element: <FeedPage /> },
      { path: "post/:id", element: <PostDetail /> },
      { path: "/report", element: <Report /> },
      { path: "/report/:id", element: <AnimalDetail /> }, //ting新增這行 
      { path: "/adoptlist", element:<AdoptList />},  // 新增領養頁 ting新增這行    
      { path: "/AdoptConfirm/:id", element:<AdoptConfirm />},   //ting新增這行 
      { path: "/login", element: <Login /> },
    ],
  },
]);
