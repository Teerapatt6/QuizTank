import { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, Save, Upload, Plus, Trash2, X, Check } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { GameTabs } from "@/components/games/GameTabs";
import { FormField } from "@/components/games/FormComponents";
import { MediaUpload } from "@/components/games/MediaUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockGameDetails } from "@/data/mockData";
import { Question, Knowledge, Choice } from "@/types/game";

interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
}

const TABS = [
  { id: "general", label: "General" },
  { id: "questions", label: "Questions" },
  { id: "knowledge", label: "Knowledge" },
  { id: "gameplay", label: "Gameplay" },
];

const MAX_ITEMS = 20;

const createEmptyQuestion = (id: string): Question => ({
  id,
  type: "single",
  question: "",
  choices: [
    { id: `${id}-c1`, text: "", isCorrect: false },
    { id: `${id}-c2`, text: "", isCorrect: false },
    { id: `${id}-c3`, text: "", isCorrect: false },
    { id: `${id}-c4`, text: "", isCorrect: false },
  ],
  fillAnswers: [],
});

const createEmptyKnowledge = (id: string): Knowledge => ({
  id,
  content: "",
  mediaUrl: "",
});

export default function EditGame() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("general");
  const game = mockGameDetails;
  
  const [formData, setFormData] = useState({
    name: game.name,
    visibility: game.visibility,
    category: game.category,
    language: game.language,
    tags: game.tags,
    description: game.description,
    questions: game.questions.map(q => ({ ...q, fillAnswers: q.fillAnswers || [] })) as Question[],
    knowledges: game.knowledges,
    gameplay: game.gameplay,
  });

  const [newTag, setNewTag] = useState("");
  const [newFillAnswer, setNewFillAnswer] = useState<Record<string, string>>({});
  const [coverImage, setCoverImage] = useState<MediaFile[]>([]);
  const [questionMedia, setQuestionMedia] = useState<Record<string, MediaFile[]>>({});
  const [knowledgeMedia, setKnowledgeMedia] = useState<Record<string, MediaFile[]>>({});

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  // Question management
  const addQuestion = () => {
    if (formData.questions.length >= MAX_ITEMS) return;
    const newId = `q${Date.now()}`;
    setFormData({
      ...formData,
      questions: [...formData.questions, createEmptyQuestion(newId)],
    });
  };

  const removeQuestion = (questionId: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== questionId),
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const updateQuestionType = (questionId: string, type: Question["type"]) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (!question) return;
    
    let choices = question.choices;
    if (type === "fill") {
      choices = [];
    } else if (choices.length === 0) {
      choices = [
        { id: `${questionId}-c1`, text: "", isCorrect: false },
        { id: `${questionId}-c2`, text: "", isCorrect: false },
        { id: `${questionId}-c3`, text: "", isCorrect: false },
        { id: `${questionId}-c4`, text: "", isCorrect: false },
      ];
    }
    
    updateQuestion(questionId, { 
      type, 
      choices,
      fillAnswers: type === "fill" ? (question.fillAnswers || []) : [],
    });
  };

  const updateChoiceCount = (questionId: string, count: number) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (!question) return;
    
    let newChoices = [...question.choices];
    if (count > newChoices.length) {
      for (let i = newChoices.length; i < count; i++) {
        newChoices.push({ id: `${questionId}-c${i + 1}`, text: "", isCorrect: false });
      }
    } else {
      newChoices = newChoices.slice(0, count);
    }
    
    updateQuestion(questionId, { choices: newChoices });
  };

  const updateChoice = (questionId: string, choiceId: string, updates: Partial<Choice>) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const newChoices = question.choices.map(c =>
      c.id === choiceId ? { ...c, ...updates } : c
    );
    updateQuestion(questionId, { choices: newChoices });
  };

  const toggleCorrectAnswer = (questionId: string, choiceId: string) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (!question) return;
    
    let newChoices: Choice[];
    if (question.type === "single") {
      newChoices = question.choices.map(c => ({
        ...c,
        isCorrect: c.id === choiceId,
      }));
    } else {
      newChoices = question.choices.map(c =>
        c.id === choiceId ? { ...c, isCorrect: !c.isCorrect } : c
      );
    }
    updateQuestion(questionId, { choices: newChoices });
  };

  const addFillAnswer = (questionId: string) => {
    const answer = newFillAnswer[questionId]?.trim();
    if (!answer) return;
    
    const question = formData.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const currentAnswers = question.fillAnswers || [];
    if (currentAnswers.length >= 20) return; // Max 20 answers
    if (!currentAnswers.includes(answer)) {
      updateQuestion(questionId, { fillAnswers: [...currentAnswers, answer] });
    }
    setNewFillAnswer({ ...newFillAnswer, [questionId]: "" });
  };

  const removeFillAnswer = (questionId: string, answer: string) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (!question) return;
    
    updateQuestion(questionId, {
      fillAnswers: (question.fillAnswers || []).filter(a => a !== answer),
    });
  };

  // Knowledge management
  const addKnowledge = () => {
    if (formData.knowledges.length >= MAX_ITEMS) return;
    const newId = `k${Date.now()}`;
    setFormData({
      ...formData,
      knowledges: [...formData.knowledges, createEmptyKnowledge(newId)],
    });
  };

  const removeKnowledge = (knowledgeId: string) => {
    setFormData({
      ...formData,
      knowledges: formData.knowledges.filter(k => k.id !== knowledgeId),
    });
  };

  const updateKnowledge = (knowledgeId: string, updates: Partial<Knowledge>) => {
    setFormData({
      ...formData,
      knowledges: formData.knowledges.map(k =>
        k.id === knowledgeId ? { ...k, ...updates } : k
      ),
    });
  };

  return (
    <PageLayout title="Edit Game">
      <div className="rounded-xl bg-card card-shadow overflow-hidden">
        <GameTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="border-t-4 border-primary" />
        
        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <FormField label="Name">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-muted border-0"
                />
              </FormField>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Visibility">
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) => setFormData({ ...formData, visibility: value as 'public' | 'private' })}
                  >
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
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-muted border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Language">
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger className="bg-muted border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
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
                      {formData.tags.map((tag) => (
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
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-muted border-0 min-h-[160px]"
                  />
                </FormField>
                
                <FormField label="Cover Image" hint="Upload 1 image">
                  <MediaUpload
                    files={coverImage}
                    onChange={setCoverImage}
                    maxFiles={1}
                    accept="image/*"
                    placeholder="Click to upload cover image"
                  />
                </FormField>
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="space-y-6">
              {formData.questions.map((question, index) => (
                <div key={question.id} className="space-y-4 pb-6 border-b border-border last:border-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Question #{index + 1}</h3>
                    <Button 
                      variant="remove" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                  
                  <FormField label="Type">
                    <Select 
                      value={question.type} 
                      onValueChange={(value) => updateQuestionType(question.id, value as Question["type"])}
                    >
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
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                        className="bg-muted border-0 min-h-[120px]"
                      />
                    </FormField>
                    
                    <FormField label="Question Media" hint="Max 10 images/videos">
                      <MediaUpload
                        files={questionMedia[question.id] || []}
                        onChange={(files) => setQuestionMedia({ ...questionMedia, [question.id]: files })}
                        maxFiles={10}
                        accept="image/*,video/*"
                      />
                    </FormField>
                  </div>
                  
                  {/* Choice-based question types */}
                  {(question.type === "single" || question.type === "multiple") && (
                    <>
                      <FormField label="Number of Choices">
                        <Select 
                          value={String(question.choices.length)} 
                          onValueChange={(value) => updateChoiceCount(question.id, parseInt(value))}
                        >
                          <SelectTrigger className="bg-muted border-0 w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="6">6</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.choices.map((choice, choiceIndex) => (
                          <div 
                            key={choice.id} 
                            className={`relative rounded-xl border-2 transition-all ${
                              choice.isCorrect 
                                ? "border-primary bg-primary/5" 
                                : "border-border bg-muted hover:border-primary/30"
                            }`}
                          >
                            {/* Header with choice number and mark as answer */}
                            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                              <div className="flex items-center gap-2">
                                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                                  choice.isCorrect 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-primary/20 text-primary"
                                }`}>
                                  {choiceIndex + 1}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground">
                                  Choice {choiceIndex + 1}
                                </span>
                              </div>
                              <button 
                                type="button"
                                onClick={() => toggleCorrectAnswer(question.id, choice.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all ${
                                  question.type === "single" ? "rounded-full" : "rounded-lg"
                                } ${
                                  choice.isCorrect 
                                    ? "bg-primary text-primary-foreground shadow-sm" 
                                    : "bg-background text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border"
                                }`}
                              >
                                <span className={`flex h-4 w-4 items-center justify-center shrink-0 border-2 ${
                                  question.type === "single" ? "rounded-full" : "rounded"
                                } ${
                                  choice.isCorrect 
                                    ? "border-primary-foreground bg-primary-foreground" 
                                    : "border-current"
                                }`}>
                                  {choice.isCorrect && <Check className="h-3 w-3 text-primary" />}
                                </span>
                                {choice.isCorrect ? "Correct" : "Mark as answer"}
                              </button>
                            </div>
                            {/* Textarea for choice content */}
                            <div className="p-3">
                              <Textarea
                                value={choice.text}
                                onChange={(e) => updateChoice(question.id, choice.id, { text: e.target.value })}
                                placeholder={`Enter option ${choiceIndex + 1} text...`}
                                className="bg-background border-0 min-h-[80px] focus-visible:ring-1 focus-visible:ring-primary/50 resize-none rounded-lg"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Fill-in question type */}
                  {question.type === "fill" && (
                    <div className="space-y-4">
                      <FormField label="Answer">
                        <div className="flex gap-2">
                          <Input
                            value={newFillAnswer[question.id] || ""}
                            onChange={(e) => setNewFillAnswer({ ...newFillAnswer, [question.id]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFillAnswer(question.id))}
                            placeholder="Enter accepted answer..."
                            className="bg-muted border-0 flex-1"
                          />
                          <Button variant="primary" onClick={() => addFillAnswer(question.id)}>Add</Button>
                        </div>
                      </FormField>
                      
                      {(question.fillAnswers || []).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(question.fillAnswers || []).map((answer) => (
                            <Badge key={answer} variant="removable" className="gap-1">
                              {answer}
                              <button 
                                onClick={() => removeFillAnswer(question.id, answer)} 
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {(question.fillAnswers || []).length >= 20 && (
                        <p className="text-sm text-muted-foreground">Maximum of 20 accepted answers reached</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="flex flex-col items-center gap-2 pt-4">
                <Button 
                  variant="primary" 
                  className="gap-2"
                  onClick={addQuestion}
                  disabled={formData.questions.length >= MAX_ITEMS}
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
                {formData.questions.length >= MAX_ITEMS && (
                  <p className="text-sm text-muted-foreground">Maximum of {MAX_ITEMS} questions reached</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "knowledge" && (
            <div className="space-y-6">
              {formData.knowledges.map((knowledge, index) => (
                <div key={knowledge.id} className="space-y-4 pb-6 border-b border-border last:border-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Knowledge #{index + 1}</h3>
                    <Button 
                      variant="remove" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => removeKnowledge(knowledge.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Content">
                      <Textarea
                        value={knowledge.content}
                        onChange={(e) => updateKnowledge(knowledge.id, { content: e.target.value })}
                        className="bg-muted border-0 min-h-[160px]"
                      />
                    </FormField>
                    
                    <FormField label="Media" hint="Max 10 images/videos">
                      <MediaUpload
                        files={knowledgeMedia[knowledge.id] || []}
                        onChange={(files) => setKnowledgeMedia({ ...knowledgeMedia, [knowledge.id]: files })}
                        maxFiles={10}
                        accept="image/*,video/*"
                      />
                    </FormField>
                  </div>
                </div>
              ))}
              
              <div className="flex flex-col items-center gap-2 pt-4">
                <Button 
                  variant="primary" 
                  className="gap-2"
                  onClick={addKnowledge}
                  disabled={formData.knowledges.length >= MAX_ITEMS}
                >
                  <Plus className="h-4 w-4" />
                  Add Knowledge
                </Button>
                {formData.knowledges.length >= MAX_ITEMS && (
                  <p className="text-sm text-muted-foreground">Maximum of {MAX_ITEMS} knowledge items reached</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "gameplay" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Game Duration (min)">
                  <Input
                    type="number"
                    min={1}
                    value={formData.gameplay.duration}
                    onChange={(e) => setFormData({
                      ...formData,
                      gameplay: { ...formData.gameplay, duration: parseInt(e.target.value) || 1 }
                    })}
                    className="bg-muted border-0"
                  />
                </FormField>
                
                <FormField label="Number of Enemies">
                  <Input
                    type="number"
                    defaultValue={formData.gameplay.enemies}
                    className="bg-muted border-0"
                  />
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Number of Hearts">
                  <Input
                    type="number"
                    defaultValue={formData.gameplay.hearts}
                    className="bg-muted border-0"
                  />
                </FormField>
                
                <FormField label="Number of Brains">
                  <Input
                    type="number"
                    defaultValue={formData.gameplay.brains}
                    className="bg-muted border-0"
                  />
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Initial Ammo">
                  <Input
                    type="number"
                    defaultValue={formData.gameplay.initialAmmo}
                    className="bg-muted border-0"
                  />
                </FormField>
                
                <FormField label="Ammo per Correct Answer">
                  <Input
                    type="number"
                    defaultValue={formData.gameplay.ammoPerCorrect}
                    className="bg-muted border-0"
                  />
                </FormField>
              </div>
              
              <FormField label="Map">
                <Select defaultValue={formData.gameplay.mapName}>
                  <SelectTrigger className="bg-muted border-0 w-full md:w-1/2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Map Name">Map Name</SelectItem>
                    <SelectItem value="Desert">Desert</SelectItem>
                    <SelectItem value="Forest">Forest</SelectItem>
                    <SelectItem value="Castle">Castle</SelectItem>
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

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 mt-6">
        <div className="flex justify-center gap-4">
          <Button variant="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Edit with AI
          </Button>
          <Button variant="muted" className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="primary" className="gap-2">
            <Upload className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
