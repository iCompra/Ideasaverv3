'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/use-auth';
import LoadingSpinner from '@/src/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, ListFilter, SlidersHorizontal, Trash2, Edit, Share2, Play, Clock, Mic } from 'lucide-react';

/**
 * History page - Display and manage user's recorded notes
 * Protected route requiring authentication
 */
export default function HistoryPage() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  // Defensive loading and authentication check
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('HistoryPage: Not authenticated, redirecting to /login...');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-dark-primary-bg text-dark-text-light">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-dark-text-muted">Loading your notes history...</p>
        </div>
      </div>
    );
  }

  // Placeholder data for notes (will be replaced with actual data later)
  const placeholderNotes = [
    {
      id: '1',
      title: 'Weekly Team Meeting Ideas',
      content: 'Discussed new project proposals and team collaboration strategies. Need to follow up on budget allocation and timeline adjustments.',
      createdAt: '2 hours ago',
      duration: '3:24',
      hasAudio: true,
      tags: ['meeting', 'team', 'project']
    },
    {
      id: '2',
      title: 'Product Launch Strategy',
      content: 'Brainstormed marketing approaches for the upcoming product launch. Consider social media campaigns and influencer partnerships.',
      createdAt: '1 day ago',
      duration: '5:12',
      hasAudio: true,
      tags: ['strategy', 'marketing', 'launch']
    },
    {
      id: '3',
      title: 'Weekend Project Ideas',
      content: 'Various hobby projects to work on this weekend including home automation and learning new programming frameworks.',
      createdAt: '3 days ago',
      duration: '2:45',
      hasAudio: true,
      tags: ['personal', 'projects', 'learning']
    }
  ];

  return (
    <div className="min-h-screen bg-dark-primary-bg text-dark-text-light py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Notes History</h1>
          <p className="text-dark-text-muted text-lg">
            Manage and search through your recorded ideas and notes
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
              <Input 
                placeholder="Search by title, content, or tags..." 
                className="pl-10 bg-dark-secondary-bg border-dark-border-subtle text-dark-text-light placeholder-dark-text-muted rounded-lg focus:border-accent-purple" 
              />
            </div>
            <Button 
              variant="outline"
              className="bg-dark-secondary-bg border-dark-border-subtle text-dark-text-light hover:bg-dark-tertiary-bg rounded-lg"
              onClick={() => console.log('Filter clicked')}
            >
              <ListFilter className="w-5 h-5 mr-2" /> 
              Filter
            </Button>
            <Button 
              variant="outline"
              className="bg-dark-secondary-bg border-dark-border-subtle text-dark-text-light hover:bg-dark-tertiary-bg rounded-lg"
              onClick={() => console.log('Sort clicked')}
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" /> 
              Sort
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-dark-secondary-bg border-dark-border-subtle">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent-purple">{placeholderNotes.length}</div>
                <div className="text-sm text-dark-text-muted">Total Notes</div>
              </CardContent>
            </Card>
            <Card className="bg-dark-secondary-bg border-dark-border-subtle">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent-blue">11m 21s</div>
                <div className="text-sm text-dark-text-muted">Total Audio</div>
              </CardContent>
            </Card>
            <Card className="bg-dark-secondary-bg border-dark-border-subtle">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">3</div>
                <div className="text-sm text-dark-text-muted">This Week</div>
              </CardContent>
            </Card>
            <Card className="bg-dark-secondary-bg border-dark-border-subtle">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">8</div>
                <div className="text-sm text-dark-text-muted">Tags Used</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {placeholderNotes.length > 0 ? (
            placeholderNotes.map((note) => (
              <Card key={note.id} className="bg-dark-secondary-bg border-dark-border-subtle rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-dark-secondary-bg/80">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-dark-text-light text-lg mb-1">{note.title}</CardTitle>
                      <div className="flex items-center text-dark-text-muted text-sm space-x-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {note.createdAt}
                        </div>
                        {note.hasAudio && (
                          <div className="flex items-center">
                            <Mic className="w-4 h-4 mr-1" />
                            {note.duration}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-dark-text-light mb-4 line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 bg-accent-purple/20 text-accent-purple text-xs rounded-full border border-accent-purple/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {note.hasAudio && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-dark-text-muted hover:text-accent-purple hover:bg-accent-purple/10" 
                          onClick={() => console.log('Play audio for note:', note.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-dark-text-muted hover:text-accent-blue hover:bg-accent-blue/10" 
                        onClick={() => console.log('Edit note:', note.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-dark-text-muted hover:text-green-400 hover:bg-green-400/10" 
                        onClick={() => console.log('Share note:', note.id)}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10" 
                      onClick={() => console.log('Delete note:', note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-dark-secondary-bg border-dark-border-subtle rounded-xl shadow-lg">
              <CardContent className="p-12 text-center">
                <Mic className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dark-text-light mb-2">No notes yet</h3>
                <p className="text-dark-text-muted mb-6">
                  Start recording your ideas to see them here
                </p>
                <Button 
                  className="btn-gradient"
                  onClick={() => router.push('/record')}
                >
                  Record Your First Note
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination Placeholder */}
        {placeholderNotes.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled className="bg-dark-secondary-bg border-dark-border-subtle text-dark-text-muted">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-accent-purple border-accent-purple text-white">
                1
              </Button>
              <Button variant="outline" size="sm" className="bg-dark-secondary-bg border-dark-border-subtle text-dark-text-light">
                2
              </Button>
              <Button variant="outline" size="sm" className="bg-dark-secondary-bg border-dark-border-subtle text-dark-text-light">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}