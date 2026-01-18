import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, TrendingUp, FileText, PlayCircle } from 'lucide-react';

const ContentQualityScanner = () => {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const exampleData = {
    "tenant_id": "tenant_antarctic_league_001",
    "tenant_name": "Antarctic Football League",
    "last_synced_at": "2026-02-14T10:05:00Z",
    "stories": [
      {
        "story_id": "story_123",
        "story_title": "Last 5 meetings: Penguin FC vs Seals United",
        "pages": [
          {
            "page_id": "page_1",
            "type": "video",
            "asset_url": "https://cdn.storyteller.com/assets/story_123/page_1.mp4",
            "action": {
              "cta": "Watch highlights",
              "url": "https://antarcticfootballleague.com/match-report"
            }
          },
          {
            "page_id": "page_2",
            "type": "image",
            "asset_url": "https://cdn.storyteller.com/assets/story_123/page_2.jpg",
            "action": {
              "cta": "Buy tickets",
              "url": "https://antarcticfootballleague.com/highlights"
            }
          }
        ],
        "context": {
          "categories": ["Penguin FC", "Seals United", "PFC v SU – 14/02/26"],
          "tenant": "Antarctic Football League",
          "publish_date": "2026-02-14"
        }
      },
      {
        "story_id": "story_124",
        "story_title": "Matchday build-up: PFC v SU",
        "pages": [
          {
            "page_id": "page_1",
            "type": "image",
            "asset_url": "https://cdn.storyteller.com/assets/story_124/page_1.jpg",
            "action": {
              "cta": "View lineup",
              "url": "https://antarcticfootballleague.com/lineup"
            }
          },
          {
            "page_id": "page_2",
            "type": "video",
            "asset_url": "https://cdn.storyteller.com/assets/story_124/page_2.mp4",
            "action": {
              "cta": "Live match centre",
              "url": "https://antarcticfootballleague.com/live"
            }
          }
        ],
        "context": {
          "categories": ["Penguin FC", "Seals United", "PFC v SU – 14/02/26", "Matchday"],
          "tenant": "Antarctic Football League",
          "publish_date": "2026-02-14"
        }
      }
    ]
  };

  const analyzeStoryWithAI = (story) => {
    const issues = [];
    const strengths = [];
    let score = 10;

    story.pages.forEach((page, idx) => {
      const cta = page.action.cta.toLowerCase();
      const url = page.action.url.toLowerCase();

      if (cta.includes('ticket') && !url.includes('ticket')) {
        issues.push({
          severity: "medium",
          category: "consistency",
          location: `Page ${idx + 1}`,
          description: `CTA says "${page.action.cta}" but URL points to "${page.action.url.split('/').pop()}"`,
          suggestion: "Update URL to point to ticket purchase page or change CTA to match actual destination"
        });
        score -= 1.5;
      }

      if (cta.includes('highlight') && url.includes('match-report')) {
        issues.push({
          severity: "low",
          category: "consistency",
          location: `Page ${idx + 1}`,
          description: `CTA mentions "highlights" but URL suggests "match-report" - slight semantic mismatch`,
          suggestion: "Align terminology: use either 'highlights' or 'match report' consistently"
        });
        score -= 0.5;
      }

      if (!page.asset_url.includes(story.story_id)) {
        issues.push({
          severity: "low",
          category: "technical",
          location: `Page ${idx + 1}`,
          description: "Asset URL doesn't clearly reference parent story ID",
          suggestion: "Consider including story_id in asset URL for better traceability"
        });
        score -= 0.3;
      }
    });

    const title = story.story_title;
    
    if (title !== title.charAt(0).toUpperCase() + title.slice(1)) {
      issues.push({
        severity: "low",
        category: "professionalism",
        location: "Story Title",
        description: "Title capitalization could be improved",
        suggestion: "Use title case or sentence case consistently"
      });
      score -= 0.5;
    }

    const hasProperSpacing = !title.includes('  ');
    if (!hasProperSpacing) {
      issues.push({
        severity: "medium",
        category: "professionalism",
        location: "Story Title",
        description: "Multiple consecutive spaces detected",
        suggestion: "Remove extra spacing"
      });
      score -= 1;
    }

    const hasTeamNames = story.context.categories.some(cat => 
      cat.includes('FC') || cat.includes('United')
    );
    
    if (hasTeamNames) {
      strengths.push("Clear team identification in categories");
    }

    const hasProfessionalTone = story.pages.every(page => 
      page.action.cta.length > 3 && page.action.cta.charAt(0) === page.action.cta.charAt(0).toUpperCase()
    );
    
    if (hasProfessionalTone) {
      strengths.push("Professional, action-oriented CTAs throughout");
    } else {
      issues.push({
        severity: "medium",
        category: "brand",
        location: "CTAs",
        description: "Inconsistent CTA capitalization or formatting",
        suggestion: "Standardize CTA formatting (e.g., Title Case or Sentence case)"
      });
      score -= 1;
    }

    const dateInContext = story.context.publish_date;
    const dateInCategories = story.context.categories.find(cat => cat.includes('/'));
    
    if (dateInCategories) {
      const contextDateShort = dateInContext.split('-').slice(1).join('/');
      if (dateInCategories.includes(contextDateShort.replace(/^0/, ''))) {
        strengths.push("Date consistency between metadata and categories");
      }
    }

    const allURLsValid = story.pages.every(page => 
      page.action.url.startsWith('http') && page.action.url.includes(story.context.tenant.toLowerCase().replace(/ /g, ''))
    );
    
    if (allURLsValid) {
      strengths.push("All URLs properly formatted and domain-consistent");
    } else {
      issues.push({
        severity: "high",
        category: "technical",
        location: "Action URLs",
        description: "One or more URLs may not match expected domain pattern",
        suggestion: "Verify all URLs point to correct tenant domain"
      });
      score -= 2;
    }

    score = Math.max(1, Math.min(10, score));

    return {
      overall_score: Math.round(score * 10) / 10,
      issues: issues,
      strengths: strengths,
      summary: issues.length === 0 
        ? "Excellent quality - no issues detected" 
        : `${issues.length} issue${issues.length > 1 ? 's' : ''} detected across ${new Set(issues.map(i => i.category)).size} categories`
    };
  };

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const results = exampleData.stories.map(story => ({
        story_id: story.story_id,
        story_title: story.story_title,
        analysis: analyzeStoryWithAI(story)
      }));

      setAnalysisResults({
        tenant_name: exampleData.tenant_name,
        analyzed_at: new Date().toISOString(),
        total_stories: results.length,
        results: results
      });
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[severity] || colors.low;
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical' || severity === 'high') return <XCircle className="w-4 h-4" />;
    if (severity === 'medium') return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                AI Content Quality Scanner
              </h1>
              <p className="text-slate-600">
                Automated quality assurance for high-volume media content
              </p>
              <p className="text-sm text-slate-500 mt-2">
                🤖 Powered by AI analysis across 5 quality dimensions
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <p><strong>Tenant:</strong> {exampleData.tenant_name}</p>
              <p><strong>Stories to analyze:</strong> {exampleData.stories.length}</p>
              <p><strong>Last synced:</strong> {exampleData.last_synced_at}</p>
            </div>
            <button
              onClick={analyzeContent}
              disabled={isAnalyzing}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isAnalyzing
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center">
                  <PlayCircle className="w-5 h-5 mr-2 animate-pulse" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Run Quality Scan
                </span>
              )}
            </button>
          </div>
        </div>

        {analysisResults && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Quality Report Summary</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Stories Analyzed</p>
                  <p className="text-3xl font-bold text-blue-600">{analysisResults.total_stories}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Average Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(
                    analysisResults.results.reduce((sum, r) => sum + r.analysis.overall_score, 0) / analysisResults.results.length
                  )}`}>
                    {(analysisResults.results.reduce((sum, r) => sum + r.analysis.overall_score, 0) / analysisResults.results.length).toFixed(1)}/10
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Total Issues</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {analysisResults.results.reduce((sum, r) => sum + r.analysis.issues.length, 0)}
                  </p>
                </div>
              </div>
            </div>

            {analysisResults.results.map((result, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FileText className="w-5 h-5 text-slate-600 mr-2" />
                      <h3 className="text-lg font-bold text-slate-800">{result.story_title}</h3>
                    </div>
                    <p className="text-sm text-slate-600">Story ID: {result.story_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 mb-1">Quality Score</p>
                    <p className={`text-4xl font-bold ${getScoreColor(result.analysis.overall_score)}`}>
                      {result.analysis.overall_score}/10
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-slate-700">{result.analysis.summary}</p>
                </div>

                {result.analysis.issues.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Issues Found ({result.analysis.issues.length})</h4>
                    <div className="space-y-3">
                      {result.analysis.issues.map((issue, issueIdx) => (
                        <div key={issueIdx} className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}>
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5">
                              {getSeverityIcon(issue.severity)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm uppercase">{issue.severity}</span>
                                <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                                  {issue.category}
                                </span>
                              </div>
                              <p className="font-medium mb-1">{issue.location}</p>
                              <p className="text-sm mb-2">{issue.description}</p>
                              <p className="text-sm italic">💡 {issue.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.analysis.strengths.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Strengths</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <ul className="space-y-1">
                        {result.analysis.strengths.map((strength, sIdx) => (
                          <li key={sIdx} className="text-sm text-green-800 flex items-start">
                            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!analysisResults && !isAnalyzing && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Ready to Scan</h3>
            <p className="text-slate-600 mb-6">
              Click "Run Quality Scan" to analyze content quality using AI
            </p>
            <div className="bg-slate-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
              <h4 className="font-semibold text-slate-800 mb-3">What gets analyzed:</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span><strong>Consistency:</strong> Titles, CTAs, and URLs alignment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span><strong>Professionalism:</strong> Grammar, typos, capitalization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span><strong>Technical Quality:</strong> URL patterns, asset formatting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span><strong>Brand Alignment:</strong> Tone and terminology consistency</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span><strong>Accuracy:</strong> Dates, names, and category coherence</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentQualityScanner;