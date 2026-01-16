import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Sparkles, ChevronLeft, ChevronRight, Plus, Trash2, X, Image } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionHeader, FormField } from "@/components/games/FormComponents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CreationMode = "select" | "user" | "ai";
type UserStep = 1 | 2 | 3 | 4;

export default function CreateGame() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<CreationMode>("select");
  const [userStep, setUserStep] = useState<UserStep>(1);
  const [tags, setTags] = useState<string[]>(["Fractions", "Area", "Prime Numbers"]);
  const [newTag, setNewTag] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const stepTitles: Record<UserStep, string> = {
    1: "General Information",
    2: "Questions",
    3: "Knowledges",
    4: "Gameplay Settings",
  };

  const renderModeSelection = () => (
    <div className="rounded-xl bg-card card-shadow overflow-hidden">
      <SectionHeader title="Creation Mode" />
      
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* User-Created Mode */}
          <button
            onClick={() => setMode("user")}
            className="text-left p-8 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary mb-6">
              <Wrench className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">User-Created Mode</h3>
            <p className="text-muted-foreground mb-4">
              Manually create all questions and knowledge content. Full control over every detail.
            </p>
            <Badge variant="step">4 Step</Badge>
          </button>

          {/* AI-Generated Mode */}
          <button
            onClick={() => setMode("ai")}
            className="text-left p-8 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ai mb-6">
              <Sparkles className="h-8 w-8 text-ai-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">AI-Generated Mode</h3>
            <p className="text-muted-foreground mb-4">
              Let AI create questions and knowledge content based on your prompt.
            </p>
            <Badge variant="stepAi">1 Step</Badge>
          </button>
        </div>
      </div>
    </div>
  );

  const renderUserCreatedStep = () => (
    <div className="rounded-xl bg-card card-shadow overflow-hidden">
      <SectionHeader title={stepTitles[userStep]} stepInfo={`Step ${userStep} of 4`} />
      
      <div className="p-6">
        {userStep === 1 && (
          <div className="space-y-6">
            <FormField label="Name">
              <Input defaultValue="Math Quiz" className="bg-muted border-0" />
            </FormField>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Visibility">
                <Select defaultValue="public">
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              
              <FormField label="Category">
                <Select defaultValue="Mathematics">
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Language">
                <Select defaultValue="English">
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              
              <FormField label="Tags">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add a tag..."
                      className="bg-muted border-0 flex-1"
                    />
                    <Button variant="primary" onClick={addTag}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="removable" className="gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Description">
                <Textarea
                  defaultValue="This Math Quiz assesses students' understanding of Fractions, Area, and Prime Numbers through three types of questions: Single Answer, Multiple Answers, and Fill-in. Learners must apply mathematical reasoning, perform calculations, and recall key concepts in number theory and geometry."
                  className="bg-muted border-0 min-h-[160px]"
                />
              </FormField>
              
              <FormField label="Cover Image">
                <div className="bg-muted rounded-lg h-40 flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                  <div className="bg-primary/80 text-primary-foreground px-8 py-6 rounded-lg text-center">
                    <div className="text-2xl font-bold">MATH</div>
                    <div className="text-xl font-bold">QUIZ</div>
                  </div>
                </div>
              </FormField>
            </div>
          </div>
        )}

        {userStep === 2 && (
          <div className="space-y-6">
            {/* Question #1 */}
            <div className="space-y-4 pb-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Question #1</h3>
                <Button variant="remove" size="sm" className="gap-1">
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
              
              <FormField label="Type">
                <Select defaultValue="single">
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Choice (Single Answer)</SelectItem>
                    <SelectItem value="multiple">Choice (Multiple Answers)</SelectItem>
                    <SelectItem value="fill">Fill-in</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Question">
                  <Textarea defaultValue="Which fraction is equivalent to 2/3?" className="bg-muted border-0 min-h-[120px]" />
                </FormField>
                
                <FormField label="Question Media" hint="Accepted file: Image, Video">
                  <div className="bg-muted rounded-lg h-[120px] flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                </FormField>
              </div>
              
              <FormField label="Number of Choices">
                <Select defaultValue="4">
                  <SelectTrigger className="bg-muted border-0 w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { num: 1, text: "4/6", correct: true },
                  { num: 2, text: "3/5", correct: false },
                  { num: 3, text: "6/10", correct: false },
                  { num: 4, text: "8/12", correct: false },
                ].map((choice) => (
                  <div 
                    key={choice.num} 
                    className={`relative rounded-xl border-2 transition-all ${
                      choice.correct 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-muted hover:border-primary/30"
                    }`}
                  >
                    {/* Header with choice number and mark as answer */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                          choice.correct 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-primary/20 text-primary"
                        }`}>
                          {choice.num}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                          Choice {choice.num}
                        </span>
                      </div>
                      <button 
                        type="button"
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          choice.correct 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "bg-background text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border"
                        }`}
                      >
                        <span className={`flex h-4 w-4 items-center justify-center shrink-0 border-2 rounded-full ${
                          choice.correct 
                            ? "border-primary-foreground bg-primary-foreground" 
                            : "border-current"
                        }`}>
                          {choice.correct && <span className="text-primary text-xs">✓</span>}
                        </span>
                        {choice.correct ? "Correct" : "Mark as answer"}
                      </button>
                    </div>
                    {/* Textarea for choice content */}
                    <div className="p-3">
                      <Textarea
                        defaultValue={choice.text}
                        placeholder={`Enter option ${choice.num} text...`}
                        className="bg-background border-0 min-h-[80px] focus-visible:ring-1 focus-visible:ring-primary/50 resize-none rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question #2 placeholder */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Question #2</h3>
              <FormField label="Type">
                <Select>
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Choice (Single Answer)</SelectItem>
                    <SelectItem value="multiple">Choice (Multiple Answers)</SelectItem>
                    <SelectItem value="fill">Fill-in</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button variant="primary" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>
        )}

        {userStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-4 pb-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Knowledge #1</h3>
                <Button variant="remove" size="sm" className="gap-1">
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Text Content">
                  <Textarea
                    defaultValue="The area of a triangle is found by multiplying its base by its height, then dividing by two."
                    className="bg-muted border-0 min-h-[160px]"
                  />
                </FormField>
                
                <FormField label="Media Content" hint="Accepted file: Image, Video">
                  <div className="bg-muted rounded-lg h-[160px] flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                    <div className="bg-success/20 w-full h-full flex items-center justify-center rounded-lg">
                      <span className="text-xs text-muted-foreground">Triangle Area Formula</span>
                    </div>
                  </div>
                </FormField>
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button variant="primary" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Knowledge
              </Button>
            </div>
          </div>
        )}

        {userStep === 4 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Game Duration">
                <Input type="text" defaultValue="4 min" className="bg-muted border-0" />
              </FormField>
              
              <FormField label="Number of Enemies">
                <Input type="number" defaultValue={20} className="bg-muted border-0" />
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Number of Hearts">
                <Input type="number" defaultValue={5} className="bg-muted border-0" />
              </FormField>
              
              <FormField label="Number of Brains">
                <Input type="number" defaultValue={5} className="bg-muted border-0" />
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Initial Ammo">
                <Input type="number" defaultValue={3} className="bg-muted border-0" />
              </FormField>
              
              <FormField label="Ammo per Correct Answer">
                <Input type="number" defaultValue={2} className="bg-muted border-0" />
              </FormField>
            </div>
            
            <FormField label="Map">
              <Select defaultValue="Map Name">
                <SelectTrigger className="bg-muted border-0 w-full md:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Map Name">Map Name</SelectItem>
                  <SelectItem value="Desert">Desert</SelectItem>
                  <SelectItem value="Forest">Forest</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            
            <div className="bg-muted rounded-lg h-48 flex items-center justify-center mt-2 md:w-1/2">
              <div className="text-muted-foreground text-sm">Map Preview</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAIMode = () => (
    <div className="rounded-xl bg-card card-shadow overflow-hidden">
      <SectionHeader title="Game Information" stepInfo="Step 1 of 1" />
      
      <div className="p-6">
        <FormField label="AI Prompt" hint="for generate Game Details">
          <Textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Generate 10 Math Quiz questions in English on Fractions, Area, and Prime Numbers.

Include:
- At least 3 Single Answer questions
- At least 3 Multiple Answers questions (6 choices each, exactly 2 correct answers)
- At least 3 Fill-in questions where the answer must be a decimal with two digits
- Three Knowledge Boxes containing key concepts students need to answer the questions."
            className="bg-muted border-0 min-h-[300px]"
          />
        </FormField>
      </div>
    </div>
  );

  const renderNavigation = () => {
    if (mode === "select") return null;

    return (
      <div className="flex justify-between mt-6">
        <Button
          variant="muted"
          className="gap-2"
          onClick={() => {
            if (mode === "user" && userStep > 1) {
              setUserStep((userStep - 1) as UserStep);
            } else {
              setMode("select");
            }
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        {mode === "user" && userStep < 4 ? (
          <Button
            variant="primary"
            className="gap-2"
            onClick={() => setUserStep((userStep + 1) as UserStep)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="primary" className="gap-2">
            <Sparkles className="h-4 w-4" />
            {mode === "ai" ? "Generate" : "Create Game"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <PageLayout title="Create Game">
      {mode === "select" && renderModeSelection()}
      {mode === "user" && renderUserCreatedStep()}
      {mode === "ai" && renderAIMode()}
      {renderNavigation()}
    </PageLayout>
  );
}
