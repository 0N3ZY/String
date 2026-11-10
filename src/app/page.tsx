"use client";

import { useMemo, useState, type MouseEvent } from "react";
import {
  AtSign, Bell, Check, CheckCheck, ChevronDown, Compass, Hash,
  Headphones, Menu, MessageCircle, MoreHorizontal, Plus, Search,
  Send, Settings, Smile, Users, X, Paperclip, Pin, Mic, Image as ImageIcon
} from "lucide-react";

type Channel = { name: string; unread?: number };
type ChatTab = { id: string; title: string; subtitle: string; kind: "channel" | "dm" };
type Message = { id: number; author: string; initials: string; time: string; text: string; mine?: boolean; color: string; reaction?: number };

const initialMessages: Message[] = [
  { id: 1, author: "Alex Morgan", initials: "AM", time: "10:24 AM", text: "Hey everyone! Welcome to our new little corner of the internet.\nWhat are you working on today?", color: "lavender" },
  { id: 2, author: "Jamie Lee", initials: "JL", time: "10:26 AM", text: "Putting the finishing touches on a new project. Excited to share it here!\nAnyone around for a quick feedback session later?", color: "teal", reaction: 3 },
  { id: 3, author: "You", initials: "YO", time: "10:28 AM", text: "Count me in! I'm exploring a few ideas for the chat layout.\nI'll drop a preview in #share-your-work shortly.", color: "lavender", mine: true },
  { id: 4, author: "Alex Morgan", initials: "AM", time: "10:29 AM", text: "Sounds good! Looking forward to seeing it.", color: "lavender" },
];

const channels: Channel[] = [
  { name: "welcome" },
  { name: "announcements" },
  { name: "general", unread: 3 },
  { name: "introductions" },
  { name: "share-your-work" },
];

const servers = [
  { id: "studio", letter: "S", name: "Studio", color: "#8175ed" },
  { id: "project", letter: "P", name: "Project", color: "#326b69" },
  { id: "art", letter: "A", name: "Art club", color: "#80583f" },
  { id: "music", letter: "M", name: "Music", color: "#405574" },
  { id: "friends", letter: "F", name: "Friends", color: "#714a70" },
];

export default function Home() {
  const [activeChannel, setActiveChannel] = useState("general");
  const [activeServer, setActiveServer] = useState(servers[0]);
  const [tabs, setTabs] = useState<ChatTab[]>([
    { id: "general", title: "general", subtitle: "Studio", kind: "channel" },
    { id: "introductions", title: "introductions", subtitle: "Studio", kind: "channel" },
    { id: "alex", title: "Alex Morgan", subtitle: "Direct message", kind: "dm" },
  ]);
  const [activeTab, setActiveTab] = useState("general");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [threadRootId, setThreadRootId] = useState<number | null>(null);
  const [threadReplies, setThreadReplies] = useState<Record<number, Message[]>>({});
  const [pathInput, setPathInput] = useState("Studio / Community / general");
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [notice, setNotice] = useState("");

  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const threadRoot = messages.find((message) => message.id === threadRootId) ?? null;
  const visibleMessages = useMemo(() => {
    if (!search.trim()) return messages;
    return messages.filter((message) => message.text.toLowerCase().includes(search.toLowerCase()) || message.author.toLowerCase().includes(search.toLowerCase()));
  }, [messages, search]);

  function openChannel(name: string) {
    setActiveChannel(name);
    setTabs((current) => current.map((tab) => tab.id === activeTab ? { ...tab, title: name, subtitle: activeServer.name, kind: "channel" } : tab));
    setThreadRootId(null);
    setPathInput(`${activeServer.name} / Community / ${name}`);
    setMobileSidebar(false);
  }

  function navigatePath() {
    const parts = pathInput.split(" / ").map((part) => part.trim()).filter(Boolean);
    const channelPart = parts.find((part) => channels.some((channel) => channel.name.toLowerCase() === part.toLowerCase()));
    if (!channelPart) { showNotice("Path not recognised. Try: Studio / Community / general"); return; }
    const channelName = channels.find((channel) => channel.name.toLowerCase() === channelPart.toLowerCase())!.name;
    setActiveChannel(channelName);
    setTabs((current) => current.map((tab) => tab.id === activeTab ? { ...tab, title: channelName, subtitle: activeServer.name, kind: "channel" } : tab));
    const replyMarker = parts.findIndex((part) => part.toLowerCase() === "reply");
    if (replyMarker >= 0) {
      const originalText = parts.slice(replyMarker + 1).join(" / ").replace(/^["“]|["”]$/g, "");
      const original = messages.find((message) => message.text === originalText) ?? messages.find((message) => message.text.toLowerCase().includes(originalText.toLowerCase()));
      if (original) setThreadRootId(original.id); else { setThreadRootId(null); showNotice("Could not find that original message in this channel"); }
    } else setThreadRootId(null);
    setMobileSidebar(false);
  }

  function openThread(message: Message) {
    setThreadRootId(message.id);
    setPathInput(`${activeServer.name} / Community / ${currentTab?.title ?? activeChannel} / reply / "${message.text}"`);
  }

  function openDM() {
    const existing = tabs.find((tab) => tab.id === "alex");
    if (!existing) setTabs((current) => [...current, { id: "alex", title: "Alex Morgan", subtitle: "Direct message", kind: "dm" }]);
    else setTabs((current) => current.map((tab) => tab.id === "alex" ? { ...tab, title: "Alex Morgan", subtitle: "Direct message", kind: "dm" } : tab));
    setActiveTab("alex");
    setThreadRootId(null);
    setPathInput(`${activeServer.name} / Direct messages / Alex Morgan`);
    setMobileSidebar(false);
  }

  function closeTab(event: MouseEvent, id: string) {
    event.stopPropagation();
    if (tabs.length === 1) return;
    const next = tabs.filter((tab) => tab.id !== id);
    setTabs(next);
    if (activeTab === id) setActiveTab(next[next.length - 1].id);
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const newMessage: Message = { id: Date.now(), author: "You", initials: "YO", time: now, text, color: "lavender", mine: true };
    if (threadRootId !== null) setThreadReplies((current) => ({ ...current, [threadRootId]: [...(current[threadRootId] ?? []), newMessage] }));
    else setMessages((current) => [...current, newMessage]);
    setDraft("");
    setShowEmoji(false);
    setShowAttach(false);
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <main className="string-app">
      <aside className="server-rail">
        <button className="brand-mark" aria-label="String home" onClick={() => showNotice("Welcome to String")}>C</button>
        <div className="rail-divider" />
        <div className="server-list">
          {servers.map((server) => (
            <button key={server.id} title={server.name} aria-label={server.name}
              className={`server-icon ${activeServer.id === server.id ? "selected" : ""}`}
              style={{ backgroundColor: server.color }}
              onClick={() => { setActiveServer(server); setActiveChannel("general"); setTabs((current) => current.map((tab) => tab.id === activeTab ? { ...tab, title: "general", subtitle: server.name, kind: "channel" } : tab)); setThreadRootId(null); setPathInput(`${server.name} / Community / general`); showNotice(`Switched to ${server.name}`); }}>
              {server.letter}
              {server.id === "art" && <span className="server-unread">2</span>}
            </button>
          ))}
        </div>
        <div className="rail-divider lower" />
        <button className="rail-action" aria-label="Add a server" onClick={() => showNotice("Server creation will be added soon")}><Plus /></button>
        <button className="rail-action" aria-label="Explore communities" onClick={() => showNotice("Community discovery is coming soon")}><Compass /></button>
        <div className="rail-spacer" />
        <button className="my-avatar" aria-label="Your profile" onClick={() => showNotice("Profile settings will be added soon")}>YO<span /></button>
      </aside>

      <aside className={`workspace-sidebar ${mobileSidebar ? "mobile-open" : ""}`}>
        <button className="workspace-heading" onClick={() => showNotice(`${activeServer.name} workspace menu`)}>
          <span>{activeServer.name}</span><ChevronDown size={16} />
        </button>
        <div className="sidebar-rule" />
        <div className="sidebar-scroll">
          <p className="sidebar-label">YOUR WORKSPACE</p>
          <button className="sidebar-link" onClick={() => showNotice("Channel browser is coming soon")}><Hash size={16} />Browse channels</button>
          <button className="sidebar-link" onClick={openDM}><AtSign size={16} />Direct messages</button>

          <div className="channel-group">
            <p className="group-label"><ChevronDown size={11} /> COMMUNITY</p>
            {channels.map((channel) => (
              <button key={channel.name} className={`channel-link ${activeChannel === channel.name && currentTab?.kind === "channel" ? "active" : ""}`}
                onClick={() => openChannel(channel.name)}>
                <Hash size={16} /><span>{channel.name}</span>
                {channel.unread && <span className="unread-count">{channel.unread}</span>}
              </button>
            ))}
          </div>

          <div className="channel-group voice-group">
            <p className="group-label"><ChevronDown size={11} /> VOICE LOUNGE</p>
            <button className="sidebar-link" onClick={() => showNotice("Voice lounge is not connected yet")}><Headphones size={16} />The lounge</button>
          </div>
        </div>
        <div className="sidebar-promo">
          <strong>A little better, together.</strong>
          <p>A space to share ideas, ask questions, and hang out.</p>
        </div>
        <div className="connection-status"><span className="online-dot" /><span>Connected<small>{activeServer.name} community</small></span></div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileSidebar(!mobileSidebar)}><Menu /></button>
          <div className="chat-tabs">
            {tabs.map((tab) => (
              <button key={tab.id} className={`chat-tab ${activeTab === tab.id ? "current" : ""}`} onClick={() => { setActiveTab(tab.id); if (tab.kind === "channel") { setActiveChannel(tab.title); setPathInput(`${tab.subtitle} / Community / ${tab.title}`); setThreadRootId(null); } else setPathInput(`${tab.subtitle} / ${tab.title}`); }}>
                <span className="tab-title">{tab.kind === "channel" ? <Hash size={13} /> : <AtSign size={13} />}{tab.title}</span>
                <span className="tab-subtitle">{tab.subtitle}</span>
                <span className="tab-close" role="button" aria-label={`Close ${tab.title}`} onClick={(event) => closeTab(event, tab.id)}><X size={13} /></span>
              </button>
            ))}
            <button className="add-tab" aria-label="Open direct message" onClick={openDM}><Plus size={18} /></button>
          </div>
          <span className="open-count">{tabs.length} open chats</span>
        </header>

        <div className="content-area">
          <div className="search-bar">
            <div className="breadcrumb"><Search size={19} /></div>
            <input className="path-input" aria-label="Channel path" placeholder="Workspace / Community / channel / reply / original message" value={pathInput} onChange={(event) => setPathInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") navigatePath(); }} />
            <button className="path-go" onClick={navigatePath}>Go</button>
          </div>

          <div className="channel-header">
            <div className="channel-heading"><Hash size={24} /><div><h1>{currentTab?.kind === "dm" ? currentTab.title : currentTab?.title ?? activeChannel}</h1><p>{currentTab?.kind === "dm" ? "Your private conversation." : "The place for a little bit of everything."}</p></div></div>
            <div className="channel-meta"><span className="online-dot" />24 online <button onClick={() => setShowMembers(!showMembers)}>{showMembers ? "Hide members" : "Members"}</button></div>
          </div>

          {showMembers && <div className="members-panel"><Users size={16} /> <strong>Community members</strong><span>Alex Morgan · Jamie Lee · You · 21 others</span></div>}

          <div className="pinned-banner"><span className="pinned-label">PINNED</span><span>Welcome to the community. Say hello and make yourself at home.</span><button onClick={() => showNotice("Pinned message selected")}>View message <span>→</span></button></div>

          <div className="message-scroll">
            <div className="date-divider"><span />Today, November 10<span /></div>
            {messages.map((message) => (
              <article key={message.id} className={`message-row ${message.mine ? "mine" : ""}`}>
                {!message.mine && <div className={`avatar ${message.color}`}>{message.initials}</div>}
                <div className="message-content">
                  <div className="message-meta"><strong>{message.author}</strong><time>{message.time}</time></div>
                  <div className={`message-bubble ${message.mine ? "outgoing" : ""}`}>{message.text}</div>
                  <button className="reply-action" onClick={() => openThread(message)}>Reply</button>
                  {message.reaction && <button className="reaction" onClick={() => setMessages((current) => current.map((item) => item.id === message.id ? { ...item, reaction: item.reaction === 3 ? 4 : 3 } : item))}><span>♡</span> {message.reaction}</button>}
                  {message.mine && <div className="delivery">Delivered <CheckCheck size={13} /></div>}
                </div>
                {message.mine && <div className="avatar lavender">{message.initials}</div>}
              </article>
            ))}
            {threadRoot && <section className="thread-panel"><div className="thread-heading"><div><strong>Replies</strong><small>Replying to {threadRoot.author}</small></div><button aria-label="Close replies" onClick={() => { setThreadRootId(null); setPathInput(`${activeServer.name} / Community / ${currentTab?.title ?? activeChannel}`); }}><X size={16}/></button></div><div className="thread-original"><strong>{threadRoot.author}</strong><p>{threadRoot.text}</p></div>{(threadReplies[threadRoot.id] ?? []).map((reply) => <div className="thread-reply" key={reply.id}><strong>{reply.author}</strong><time>{reply.time}</time><p>{reply.text}</p></div>)}{(threadReplies[threadRoot.id] ?? []).length === 0 && <p className="empty-replies">No replies yet. Start the conversation.</p>}</section>}
            {!threadRoot && <div className="typing-indicator"><span>•••</span> Jamie is typing</div>}
          </div>

          <div className="composer-wrap">
            {showAttach && <div className="composer-popover"><button onClick={() => showNotice("File attachments will be connected later")}><Paperclip size={16}/> Attach a file</button><button onClick={() => showNotice("Image uploads will be connected later")}><ImageIcon size={16}/> Upload an image</button></div>}
            {showEmoji && <div className="emoji-popover">{["😊","😂","❤️","👋","🎉","🔥","👍","✨"].map((emoji) => <button key={emoji} onClick={() => setDraft((value) => value + emoji)}>{emoji}</button>)}</div>}
            <div className="composer">
              <button className="composer-add" aria-label="Attach" onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }}><Plus size={23} /></button>
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={threadRoot ? "Reply to this message..." : `Message #${currentTab?.title ?? activeChannel}...`} rows={1}
                onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} />
              <button className="emoji-button" aria-label="Emoji" onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }}><Smile size={21} /></button>
              <button className="send-button" aria-label="Send message" onClick={sendMessage}><Send size={20} /></button>
            </div>
            <div className="composer-help"><span>{threadRoot ? "Replying in thread · " : ""}Enter to send · Shift + Enter for a new line</span><span>Keep it kind. Keep it curious.</span></div>
          </div>
        </div>
      </section>
      {notice && <div className="toast" role="status">{notice}</div>}
    </main>
  );
}