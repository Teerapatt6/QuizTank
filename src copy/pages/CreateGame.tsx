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
import { toast } from "sonner";

type CreationMode = "select" | "user" | "ai";
type UserStep = 1 | 2 | 3 | 4;

export default function CreateGame() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<CreationMode>("select");
  const [userStep, setUserStep] = useState<UserStep>(1);
  const [tags, setTags] = useState<string[]>(["Fractions", "Area", "Prime Numbers"]);
  const [newTag, setNewTag] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form state for validation
  const [gameName, setGameName] = useState("");

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleCreateGame = async () => {
    if (!gameName.trim()) {
      toast.error("Please enter a game name");
      return;
    }
    setIsLoading(true);
    // Placeholder for API integration
    setTimeout(() => {
      toast.success("Game created successfully!");
      setIsLoading(false);
      navigate("/");
    }, 1500);
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter an AI prompt");
      return;
    }
    setIsLoading(true);
    // Placeholder for API integration
    setTimeout(() => {
      toast.success("Game generated successfully!");
      setIsLoading(false);
      navigate("/");
    }, 1500);
  };

  const stepTitles: Record<UserStep, string> = {
    1: "General Information",
    2: "Questions",
    3: "Knowledges",
    4: "Gameplay Settings",
  };

  const renderModeSelection = () => (
    <div className="space-y-6">
      <div className="rounded-xl bg-card shadow-neumorphic overflow-hidden">
        <SectionHeader title="Choose Creation Mode" />
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User-Created Mode */}
            <button
              onClick={() => setMode("user")}
              className="text-left p-6 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors border-2 border-transparent hover:border-primary/30"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">User-Created Mode</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manually create all questions and knowledge content. Full control over every detail.
              </p>
              <Badge variant="secondary" className="bg-primary/20 text-primary border-0">4 Steps</Badge>
            </button>

            {/* AI-Generated Mode */}
            <button
              onClick={() => setMode("ai")}
              className="text-left p-6 rounded-xl bg-muted hover:bg-muted/80 transition-colors border-2 border-transparent hover:border-accent/30"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-4">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI-Generated Mode</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Let AI create questions and knowledge content based on your prompt.
              </p>
              <Badge variant="secondary" className="bg-accent/20 text-accent border-0">1 Step</Badge>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserCreatedStep = () => (
    <div className="rounded-xl bg-card shadow-neumorphic overflow-hidden">
      <SectionHeader title={stepTitles[userStep]} stepInfo={`Step ${userStep} of 4`} />
      
      <div className="p-6">
        {userStep === 1 && (
          <div className="space-y-6">
            <FormField label="Name">
              <Input 
                placeholder="Math Quiz" 
                className="bg-muted border-0" 
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
              />
            </FormField>
            <FormField label="Description">
              <Textarea placeholder="Description..." className="bg-muted border-0 min-h-[100px]" />
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
              
              <FormField label="Subject/Category">
                <Select defaultValue="math">
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Language">
                <Select defaultValue="en">
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="th">Thai</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              
              <FormField label="Tags">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add a tag..."
                      className="bg-muted border-0 flex-1"
                    />
                    <Button type="button" variant="primary" size="sm" onClick={addTag}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Difficulty">
                <Select defaultValue="medium">
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
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
    <div className="rounded-xl bg-card shadow-neumorphic overflow-hidden">
      <SectionHeader title="Game Information" stepInfo="Step 1 of 1" />
      
      <div className="p-6">
        <FormField label="AI Prompt" hint="for generate Game Details">
          <Textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={`Generate 10 Math Quiz questions in English on Fractions, Area, and Prime Numbers.

Include:
- At least 3 Single Answer questions
- At least 3 Multiple Answers questions (6 choices each, exactly 2 correct answers)
- At least 3 Fill-in questions where the answer must be a decimal with two digits
- Three Knowledge Boxes containing key concepts students need to answer the questions.`}
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
              setUserStep(1);
            }
          }}
          disabled={isLoading}
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
          <Button 
            variant="primary" 
            className="gap-2"
            onClick={mode === "ai" ? handleGenerate : handleCreateGame}
            disabled={isLoading}
          >
            <Sparkles className="h-4 w-4" />
            {isLoading ? "Processing..." : mode === "ai" ? "Generate" : "Create Game"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <PageLayout title="Create Game" subtitle="Design your custom quiz battle or let AI generate questions for you">
      {mode === "select" && renderModeSelection()}
      {mode === "user" && renderUserCreatedStep()}
      {mode === "ai" && renderAIMode()}
      {renderNavigation()}
    </PageLayout>
  );
}
