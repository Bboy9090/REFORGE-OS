import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash, FileText } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface WorkspaceNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export function MyWorkspace() {
  const [notes, setNotes] = useKV<WorkspaceNote[]>('bobby-workspace-notes', []);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<WorkspaceNote | null>(null);

  const addNote = () => {
    if (!newTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const note: WorkspaceNote = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: newContent.trim(),
      createdAt: new Date().toISOString()
    };

    setNotes(currentNotes => [...(currentNotes || []), note]);
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
    toast.success('Note added');
  };

  const deleteNote = (id: string) => {
    setNotes(currentNotes => (currentNotes || []).filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
    toast.success('Note deleted');
  };

  const allNotes = notes || [];

  if (selectedNote) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedNote(null)}>
          ← Back to Workspace
        </Button>

        <Card className="border-2 border-primary/30">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-2xl font-display uppercase">{selectedNote.title}</CardTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  deleteNote(selectedNote.id);
                  setSelectedNote(null);
                }}
              >
                <Trash className="w-4 h-4" weight="duotone" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Created: {new Date(selectedNote.createdAt).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {selectedNote.content || 'No content'}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display uppercase text-primary">My Workspace</h2>
          <p className="text-muted-foreground mt-1">Your personal repair notes and bookmarks</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4 mr-2" weight="duotone" />
          {isAdding ? 'Cancel' : 'New Note'}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-2 border-primary/50">
          <CardHeader>
            <CardTitle>New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Note title..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Your repair notes, tips, device info..."
                rows={6}
              />
            </div>
            <Button onClick={addNote} className="w-full">
              Save Note
            </Button>
          </CardContent>
        </Card>
      )}

      {allNotes.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" weight="duotone" />
            <p className="text-muted-foreground">No notes yet. Create your first note to track repair jobs and techniques.</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
            {allNotes.map(note => (
              <Card
                key={note.id}
                className="cursor-pointer hover:border-primary/60 transition-colors border-2 relative"
                onClick={() => setSelectedNote(note)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                >
                  <Trash className="w-4 h-4 text-destructive" weight="duotone" />
                </Button>
                <CardHeader className="pr-12">
                  <CardTitle className="text-lg font-semibold line-clamp-1">{note.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content || 'No content'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
