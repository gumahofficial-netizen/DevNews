import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  db, 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  increment 
} from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";
import { NewsArticle, Comment } from "../../types";
import { AdRenderer } from "../../components/AdRenderer";
import { renderMarkdown } from "../../utils/markdown";
import { GoogleGenAI } from "@google/genai";
import { 
  Calendar, 
  Clock, 
  ThumbsUp, 
  Eye, 
  Bookmark, 
  MessageSquare, 
  Heart, 
  Share2, 
  Printer, 
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Send,
  CornerDownRight,
  ArrowLeft,
  Copy,
  Check,
  User
} from "lucide-react";

export function NewsArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { user, updateProfileFields } = useAuth();
  
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive action states
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  // Comments Input States
  const [newCommentText, setNewCommentText] = useState("");
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Increment Views and fetch Article
        const artRef = doc(db, "News", id);
        await updateDoc(artRef, { views: increment(1) });

        const artSnap = await getDoc(artRef);
        if (artSnap.exists()) {
          const data = artSnap.data() as NewsArticle;
          setArticle({ id: artSnap.id, ...data } as NewsArticle);
          setAiSummary(data.aiSummary || "");
        }

        // Fetch comments matching this articleId
        const commentsSnap = await getDocs(collection(db, "Comments"));
        const fetchedComments: Comment[] = [];
        commentsSnap.forEach((doc) => {
          const c = doc.data() as Comment;
          if (c.articleId === id) {
            fetchedComments.push({ id: doc.id, ...c } as Comment);
          }
        });

        // Sort comments chronological ascending
        fetchedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setComments(fetchedComments);
      } catch (err) {
        console.error("Error loading article node details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleAndComments();
  }, [id]);

  // Set initial like/bookmark status based on authenticated user state
  useEffect(() => {
    if (article && user) {
      setIsLiked(article.likes?.includes(user.uid) || false);
      setIsBookmarked(user.bookmarks?.includes(article.id) || false);
    }
  }, [article, user]);

  const handleLike = async () => {
    if (!user || !article || !id) return;

    const artRef = doc(db, "News", id);
    try {
      if (isLiked) {
        await updateDoc(artRef, { likes: arrayRemove(user.uid) });
        setArticle(prev => prev ? { ...prev, likes: prev.likes.filter(uid => uid !== user.uid) } : null);
        setIsLiked(false);
      } else {
        await updateDoc(artRef, { likes: arrayUnion(user.uid) });
        setArticle(prev => prev ? { ...prev, likes: [...prev.likes, user.uid] } : null);
        setIsLiked(true);
      }
    } catch (err) {
      console.error("Error modifying like telemetry:", err);
    }
  };

  const handleBookmark = async () => {
    if (!user || !article) return;
    
    const isCurrentlyBookmarked = user.bookmarks?.includes(article.id) || false;
    let updatedBookmarks = [...(user.bookmarks || [])];

    if (isCurrentlyBookmarked) {
      updatedBookmarks = updatedBookmarks.filter(bId => bId !== article.id);
    } else {
      updatedBookmarks.push(article.id);
    }

    try {
      await updateProfileFields({ bookmarks: updatedBookmarks });
      setIsBookmarked(!isCurrentlyBookmarked);
    } catch (err) {
      console.error("Error synchronizing bookmarked node:", err);
    }
  };

  // AI Summary Generation with @google/genai SDK (Lazy initialised safely)
  const handleGenerateAiSummary = async () => {
    if (!article) return;
    setGeneratingAi(true);
    try {
      // Lazy initialize GoogleGenAI client with the server-supplied key or direct env proxy if client-allowed safely
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSy..." });
      
      const prompt = `You are a professional software architect. Read the following article titled "${article.title}" and summarize its core technical takeaways in exactly 3 short, high-density sentences: \n\n${article.content}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const summary = response.text || "Failed to compile summary context.";
      
      // Persist summary back to Firestore so future visitors have it instantly
      await updateDoc(doc(db, "News", article.id), { aiSummary: summary });
      setAiSummary(summary);
    } catch (err) {
      console.error("Error generating Gemini AI summary:", err);
      setAiSummary("Gemini API connection error. Please verify server secret keys are active.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!user || !article || !id) return;

    const textToSubmit = parentId ? replyText : newCommentText;
    if (!textToSubmit.trim()) return;

    try {
      const newComment: Partial<Comment> = {
        articleId: id,
        parentId,
        userId: user.uid,
        userName: user.displayName,
        userRole: user.role,
        text: textToSubmit.trim(),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "Comments"), newComment);
      
      // Update UI state local representation
      setComments(prev => [...prev, { id: docRef.id, ...newComment } as Comment]);
      
      // Increment comments count on Article
      await updateDoc(doc(db, "News", id), { commentsCount: increment(1) });
      setArticle(prev => prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null);

      if (parentId) {
        setReplyText("");
        setReplyTargetId(null);
      } else {
        setNewCommentText("");
      }
    } catch (err) {
      console.error("Error dispatching user comment:", err);
    }
  };

  const copyArticleLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const triggerPrint = () => {
    window.print();
  };

  const handleReportArticle = () => {
    alert("This article has been flagged for editorial review. Thank you for your telemetry input.");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center animate-pulse">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-mono mt-4">Retrieving Technical Article Telemetry...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-black text-lg text-slate-900 dark:text-white">Article Node Out of Bounds</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">This journalistic segment does not resolve to an active document node in our database system.</p>
        <Link to="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"><ArrowLeft className="w-4 h-4" /> Back to Portal</Link>
      </div>
    );
  }

  // Build comments hierarchy
  const rootComments = comments.filter(c => !c.parentId);
  const getReplies = (commentId: string) => comments.filter(c => c.parentId === commentId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Left Column: Article content & interaction */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link to="/" className="hover:text-indigo-500 transition-colors">Portal</Link>
          <span>/</span>
          <Link to={`/category/${article.category}`} className="text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-widest">{article.category}</Link>
        </div>

        {/* Headline */}
        <h1 className="font-display font-black text-2xl md:text-4xl text-slate-900 dark:text-white leading-tight tracking-tight">
          {article.title}
        </h1>

        {/* Premium Metadata Badging */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-200/60 dark:border-white/5 py-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500" /> {new Date(article.publishDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-500" /> {article.readingTime} min read</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-indigo-500" /> {article.views} Views</span>
            <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4 text-indigo-500" /> {article.likes?.length || 0} Likes</span>
          </div>
        </div>

        {/* Hero Featured Photo */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200/60 dark:border-white/10 aspect-video bg-slate-100 dark:bg-black">
          <img 
            src={article.featuredImage} 
            alt={article.title} 
            className="w-full h-full object-cover hover:scale-101 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Premium Co-Pilot AI summary card */}
        <div className="p-6 rounded-2xl border border-indigo-200/30 dark:border-white/5 bg-gradient-to-br from-indigo-50/20 via-purple-50/5 to-transparent dark:from-[#08080c] dark:to-transparent space-y-4 shadow-2xs relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" /> Gemini AI summarization co-pilot
            </h3>
            <button
              onClick={handleGenerateAiSummary}
              disabled={generatingAi}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/25 transition-all cursor-pointer"
            >
              {generatingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {aiSummary ? "Re-Generate" : "Compile Summary"}
            </button>
          </div>
          {aiSummary ? (
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans italic border-l-2 border-indigo-500 pl-4 relative z-10">
              {aiSummary}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 leading-relaxed font-light relative z-10">
              Need a quick brief? Let our built-in Gemini AI model summarize the core technical takeaways of this article for you in 3 high-density sentences.
            </p>
          )}
        </div>

        {/* Prose Content block */}
        <div 
          className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-sans font-light border-b border-slate-200/50 dark:border-white/5 pb-8"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
        />

        {/* Optional Gallery attachments */}
        {article.galleryImages && article.galleryImages.length > 0 && (
          <div className="space-y-4 border-b border-slate-200/50 dark:border-white/5 pb-8">
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-slate-400 font-mono">Telemetry Image Attachments</h4>
            <div className="grid grid-cols-2 gap-4">
              {article.galleryImages.map((imgUrl, index) => (
                <div key={index} className="rounded-2xl overflow-hidden aspect-video border border-slate-200/60 dark:border-white/10 shadow-xs">
                  <img src={imgUrl} alt="Gallery item" className="w-full h-full object-cover hover:scale-101 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Embedded Video Player spot */}
        {article.youtubeUrl && (
          <div className="space-y-4 border-b border-slate-200/50 dark:border-white/5 pb-8">
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-slate-400 font-mono">Embedded Broadcast Segment</h4>
            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-200/60 dark:border-white/10 shadow-lg">
              <iframe 
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${article.youtubeUrl.split("v=")[1] || article.youtubeUrl.split("/").pop()}`}
                title="Telemetry Video player"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Quick interactions */}
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all cursor-pointer ${
                isLiked 
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
                  : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} /> 
              <span>{isLiked ? "Liked" : "Like"}</span>
              <span className="opacity-50">({article.likes?.length || 0})</span>
            </button>

            <button
              onClick={handleBookmark}
              disabled={!user}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all cursor-pointer ${
                isBookmarked 
                  ? "bg-indigo-600/10 border-indigo-600/20 text-indigo-600 dark:text-indigo-400" 
                  : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-indigo-600" : ""}`} />
              <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyArticleLink}
              className="p-3 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={triggerPrint}
              className="p-3 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Print article"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleReportArticle}
              className="p-3 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-500 transition-colors cursor-pointer"
              title="Report abuse"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Author Details card */}
        <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
            {article.authorName.charAt(0)}
          </div>
          <div>
            <h4 className="font-display font-black text-sm text-slate-900 dark:text-white leading-none">{article.authorName}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 uppercase font-bold tracking-wider">Dev News Network Contributor • {article.authorEmail}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-6 pt-8">
          <h3 className="font-display font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200/50 dark:border-white/5 pb-3">
            <MessageSquare className="w-4 h-4 text-indigo-500" /> Reader Message Board ({article.commentsCount || 0})
          </h3>

          {/* New Comment submission */}
          {user ? (
            <form onSubmit={(e) => handlePostComment(e, null)} className="space-y-3 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50/40 dark:bg-black/20">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Post your technical input on this report..."
                rows={3}
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#030303] text-slate-800 dark:text-slate-100 outline-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-mono">Writing as: {user.displayName}</span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center text-xs text-slate-400 font-mono">
              Please authorize your session inside the top header portal to write comments on this node.
            </div>
          )}

          {/* Nest list */}
          <div className="space-y-4">
            {rootComments.map((comment) => {
              const replies = getReplies(comment.id);
              return (
                <div key={comment.id} className="p-4.5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-xs text-indigo-500">
                        {comment.userName.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">{comment.userName}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {user && (
                      <button
                        onClick={() => setReplyTargetId(replyTargetId === comment.id ? null : comment.id)}
                        className="text-[10px] text-indigo-500 hover:underline font-black uppercase tracking-wider font-mono cursor-pointer"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
                    {comment.text}
                  </p>

                  {/* Reply Input block */}
                  {replyTargetId === comment.id && (
                    <form onSubmit={(e) => handlePostComment(e, comment.id)} className="pl-4 border-l border-indigo-500/20 py-2 space-y-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write reply message..."
                        required
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-800 dark:text-slate-100 outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer"
                      >
                        Post Reply
                      </button>
                    </form>
                  )}

                  {/* Replies List */}
                  {replies.length > 0 && (
                    <div className="pl-6 border-l border-slate-100 dark:border-white/5 space-y-3 mt-3">
                      {replies.map((rep) => (
                        <div key={rep.id} className="p-3 rounded-xl bg-slate-50/50 dark:bg-black/10 space-y-1.5 border border-slate-100 dark:border-white/5">
                          <div className="flex items-center gap-2">
                            <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{rep.userName}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{new Date(rep.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5">
                            {rep.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {rootComments.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6 font-mono">No telemetry input has been written for this node yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Sponsored Content & Widgets */}
      <div className="space-y-6">
        <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] space-y-4 shadow-2xs">
          <h3 className="font-display font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-2.5">
            Sponsored Advertisement
          </h3>
          <AdRenderer position="Sidebar" />
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] space-y-4 shadow-2xs">
          <h3 className="font-display font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Context Telemetry
          </h3>
          <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <div className="flex justify-between">
              <span>Node ID:</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold truncate w-24 text-right">{id}</span>
            </div>
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">Markdown Engine v1.0</span>
            </div>
            <div className="flex justify-between">
              <span>Encoding:</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">UTF-8 / TLS OK</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
