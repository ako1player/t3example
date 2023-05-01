import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

dayjs.extend(relativeTime);

const CreatePostWizard = () =>{
  const {user} = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const {mutate, isLoading: isPosting} = api.posts.create.useMutation({
    onSuccess: () =>{
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) =>{
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if(errorMessage && errorMessage[0]){
        toast.error(errorMessage[0]);
      } else{
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  console.log(user)

  if (!user) return null;

  return <div className="flex w-full gap-3">
    <Image src={user.profileImageUrl} alt="Profile Name" className="rounded-full w-14 h-14" width={56} height={56}/>
    <input 
      placeholder="type some emojis!" 
      className="bg-transparent outline-none grow"  
      value={input}
      type="text"
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if(e.key === "Enter"){
          e.preventDefault();
          if(input !== ""){
            mutate({ content: input});
          }
        }
      }}
      disabled={isPosting}
    />
    {input !== "" && !isPosting && (<button onClick={()=> mutate({content: input})}>Post</button>)}
    {isPosting && (<div className="flex items-center justify-center"><LoadingSpinner size={20} /></div>)}
  </div>
}

const Feed = () =>{
  const {data, isLoading: postsLoadeding} = api.posts.getAll.useQuery();
  if(postsLoadeding) return <LoadingPage />

  if(!data) return <div>Something went wrong</div>
  return (
    <div className="flex flex-col">
    {data.map((fullPost) =>(
      <PostView {...fullPost} key={fullPost.post.id} />
    ))}
  </div>
  )
}

const Home: NextPage = () => {
  const {isLoaded: userLoaded, isSignedIn} = useUser();

  //start fetching asap
  api.posts.getAll.useQuery();

  //Return empty div if user isnt loaded yet
  if (!userLoaded) return <div />;
  
  return (
    <>
      <PageLayout>
          <div className="flex p-4 border-b border-slate-400">
            {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
            {isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
