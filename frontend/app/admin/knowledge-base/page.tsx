'use client';

import React, { useEffect, useState } from 'react';
import { getKnowledgeBase, uploadKnowledgeFile, scrapeKnowledgeUrl, deleteKnowledgeFile } from '../../../services/api';
import { Database, FileText, Globe, Upload, Trash2, ShieldAlert, Sparkles, RefreshCw, Layers } from 'lucide-react';

export default function AdminKnowledgeBasePage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [scraping, setScraping] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scrapeUrl, setScrapeUrl] = useState('');
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeDocPreview, setActiveDocPreview] = useState<any | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await getKnowledgeBase();
      if (res.success) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await uploadKnowledgeFile(formData);
      if (res.success) {
        setSuccessMsg(`Document "${selectedFile.name}" successfully parsed and added to context.`);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('kb-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchDocs();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleScrapeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl.trim()) return;

    setScraping(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await scrapeKnowledgeUrl(scrapeUrl);
      if (res.success) {
        setSuccessMsg(`Webpage "${scrapeUrl}" successfully crawled and indexed.`);
        setScrapeUrl('');
        fetchDocs();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to crawl website.');
    } finally {
      setScraping(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge source? Context chunks will be removed.')) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await deleteKnowledgeFile(id);
      if (res.success) {
        setSuccessMsg('Knowledge source deleted successfully.');
        if (activeDocPreview?._id === id) {
          setActiveDocPreview(null);
        }
        fetchDocs();
      }
    } catch (err) {
      setErrorMsg('Failed to delete document.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Database className="text-primary" size={28} />
            <span>RAG Knowledge Base</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Feed company text repositories, PDF specifications, DOCX guides, and website URLs directly into the AI Assistant context pipeline.
          </p>
        </div>
        <button
          onClick={fetchDocs}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-secondary text-foreground hover:bg-accent border border-border/40 rounded-xl transition-all duration-200"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Panels */}
        <section className="space-y-6">
          
          {/* File Upload card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-base text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Upload className="text-primary" size={16} />
              <span>Upload Document</span>
            </h3>
            
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="border-2 border-dashed border-border/60 hover:border-primary/50 transition-colors rounded-xl p-6 text-center cursor-pointer relative">
                <input
                  type="file"
                  id="kb-file-input"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText size={32} className="text-muted-foreground mx-auto mb-2" />
                <span className="text-xs font-bold text-foreground block">
                  {selectedFile ? selectedFile.name : 'Select PDF, DOCX or TXT'}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 block">Maximum upload file size 10MB</span>
              </div>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-xs flex justify-center items-center gap-2"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="animate-spin" size={12} />
                    <span>Parsing Document...</span>
                  </>
                ) : (
                  <span>Upload & Index</span>
                )}
              </button>
            </form>
          </div>

          {/* Web scraping card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-base text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Globe className="text-primary" size={16} />
              <span>Crawl Website URL</span>
            </h3>

            <form onSubmit={handleScrapeSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Webpage Link</label>
                <input
                  type="url"
                  placeholder="https://outpro.in/about"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={scraping || !scrapeUrl.trim()}
                className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-xs flex justify-center items-center gap-2"
              >
                {scraping ? (
                  <>
                    <RefreshCw className="animate-spin" size={12} />
                    <span>Scraping Content...</span>
                  </>
                ) : (
                  <span>Scrape & Index</span>
                )}
              </button>
            </form>
          </div>

        </section>

        {/* Index List Directory */}
        <section className="lg:col-span-2 space-y-6">
          
          {/* Active document chunks preview overlay */}
          {activeDocPreview && (
            <div className="glass-panel p-6 rounded-3xl border-2 border-primary/40 space-y-4">
              <div className="flex justify-between items-center border-b border-border/40 pb-2">
                <div>
                  <h4 className="font-extrabold text-sm text-foreground truncate max-w-xs">{activeDocPreview.title}</h4>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">RAG chunks: {activeDocPreview.chunks.length} blocks</span>
                </div>
                <button onClick={() => setActiveDocPreview(null)} className="text-xs hover:underline text-muted-foreground font-bold">Close Preview</button>
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                {activeDocPreview.chunks.map((chunk: string, idx: number) => (
                  <div key={idx} className="p-3 bg-secondary/35 rounded-xl border border-border/20 text-xs text-foreground/90 font-medium leading-relaxed">
                    <span className="text-[9px] font-bold text-primary uppercase block mb-1.5">Context Chunk #{idx + 1}</span>
                    {chunk}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-panel p-6 rounded-3xl min-h-[450px]">
            <h3 className="font-extrabold text-base text-foreground mb-4 uppercase tracking-wider flex items-center gap-1">
              <Layers size={16} className="text-primary" />
              <span>Knowledge Sources Directory</span>
            </h3>

            {loading ? (
              <div className="text-center py-20 animate-pulse text-muted-foreground">Retrieving index files...</div>
            ) : documents.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center text-muted-foreground mx-auto">
                  <Database size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-foreground text-sm">No context indexes added</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">Uploaded text and crawled links will register here as parsed vectors.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <div key={doc._id} className="p-4 bg-secondary/20 border border-border/40 rounded-2xl flex justify-between items-center gap-4">
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          doc.fileType === 'pdf' ? 'bg-red-500/10 text-red-500' :
                          doc.fileType === 'docx' ? 'bg-blue-500/10 text-blue-500' :
                          doc.fileType === 'url' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {doc.fileType}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold">
                          Indexed {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 
                        onClick={() => setActiveDocPreview(doc)}
                        className="font-extrabold text-sm text-foreground truncate cursor-pointer hover:text-primary transition-colors hover:underline"
                        title="Click to view chunks preview"
                      >
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        Chunks count: {doc.chunks.length} blocks • Text characters: {doc.content.length}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg border border-border/40 transition-colors"
                      title="Remove source"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

      </div>
    </div>
  );
}
