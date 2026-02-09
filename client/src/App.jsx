import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import NotFound from "./pages/NotFound";
import { useUser, useAuth } from "@clerk/clerk-react";
import Layout from "./pages/Layout";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "./features/user/userSlice";
import { fetchConnections } from "./features/connections/connectionsSlice";
import { useRef } from "react";
import { addMessage } from "./features/messages/messagesSlice";
import Notification from "./components/Notification";

const App = () => {
  const { pathname } = useLocation();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded || !user) return;

      const token = await getToken();
      dispatch(fetchUser(token));
      dispatch(fetchConnections(token));
    };

    fetchData();
  }, [user, isLoaded, getToken, dispatch]);

  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(
      `${import.meta.env.VITE_BASEURL}/api/message/${user.id}`,
    );

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const senderId = message.from_user_id._id;

        const currentPath = pathnameRef.current;
        const isInChatWithSender = currentPath === `/messages/${senderId}`;

        if (isInChatWithSender) {
          dispatch(addMessage(message));
        } else {
          toast.custom((t) => <Notification t={t} message={message} />, {
            position: "bottom-right",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [user, dispatch]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  if (!isLoaded) return null; // أو Loading

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
