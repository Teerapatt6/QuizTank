import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Smile, LogOut, Pencil, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SettingsTab = "account" | "notification" | "preferences";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Profile data
  const [profileName, setProfileName] = useState("John Doe");
  const [profileBio, setProfileBio] = useState("โม้ตัวเองสักนิดนึงนะ...");
  const [profileUsername, setProfileUsername] = useState("JohnDoe1234");
  const [profileEmail, setProfileEmail] = useState("johndoe@email.com");
  
  // Notification settings
  const [emailNotification, setEmailNotification] = useState(true);
  const [inGameNotification, setInGameNotification] = useState(true);
  
  // Preferences settings
  const [language, setLanguage] = useState("english");
  const [gameAudio, setGameAudio] = useState(true);
  const [backgroundMusic, setBackgroundMusic] = useState([30]);
  const [soundEffect, setSoundEffect] = useState([30]);

  const handleLogout = () => {
    navigate("/");
  };

  const handleSaveChanges = () => {
    toast.success("Profile updated successfully!");
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const menuItems = [
    { id: "account" as SettingsTab, label: "Account", icon: User },
    { id: "notification" as SettingsTab, label: "Notification", icon: Bell },
    { id: "preferences" as SettingsTab, label: "Preferences", icon: Smile },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={true} username="John" />
      <div className="py-4 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            {/* Sidebar */}
            <Card className="lg:w-64 h-fit">
              <CardContent className="p-3 md:p-4">
                <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Settings</h2>
                <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "flex items-center gap-2 md:gap-3 px-3 py-2 rounded-lg text-left transition-colors whitespace-nowrap text-sm md:text-base",
                        activeTab === item.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 md:gap-3 px-3 py-2 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-colors whitespace-nowrap text-sm md:text-base"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Log Out</span>
                  </button>
                </nav>
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="flex-1 space-y-4 md:space-y-6">
              {/* Profile Section */}
              <Card>
                <CardContent className="py-4 md:py-6 px-4 md:px-6">
                  {isEditMode ? (
                    // Edit Mode
                    <div className="space-y-4 md:space-y-6">
                      {/* Avatar with Change button */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 md:gap-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted border-4 border-background flex items-center justify-center">
                          <User className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
                        </div>
                        <div className="text-center sm:text-left">
                          <Button variant="accent" size="sm" className="text-xs md:text-sm">
                            Change
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">JPG or PNG Max 2MB</p>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="text-xs md:text-sm font-medium mb-2 block">Name</label>
                        <Input
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="bg-muted max-w-md text-sm md:text-base"
                        />
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="text-xs md:text-sm font-medium mb-2 block">Bio</label>
                        <Textarea
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          className="bg-muted min-h-[100px] md:min-h-[120px] text-sm md:text-base"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      {/* Username and Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <label className="text-xs md:text-sm font-medium mb-2 block">Username</label>
                          <Input
                            value={profileUsername}
                            onChange={(e) => setProfileUsername(e.target.value)}
                            className="bg-muted text-sm md:text-base"
                          />
                        </div>
                        <div>
                          <label className="text-xs md:text-sm font-medium mb-2 block">Email</label>
                          <Input
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="bg-muted text-sm md:text-base"
                            type="email"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <p className="font-medium text-sm md:text-base">Password</p>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2">Set a password that is unique</p>
                        <Button variant="destructive" size="sm" className="text-xs md:text-sm">
                          Reset Password
                        </Button>
                      </div>

                      {/* Two-factor Authentication */}
                      <div>
                        <p className="font-medium text-sm md:text-base">Two-factor Authentication</p>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2">Add an extra layer of security to your account</p>
                        <Button variant="accent" size="sm" className="text-xs md:text-sm">
                          Set Up
                        </Button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 pt-2 md:pt-4">
                        <Button variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto text-sm">
                          Cancel
                        </Button>
                        <Button variant="accent" onClick={handleSaveChanges} className="w-full sm:w-auto text-sm">
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted border-4 border-background flex items-center justify-center">
                          <User className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h3 className="text-lg md:text-xl font-bold">{profileName}</h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs md:text-sm w-fit mx-auto sm:mx-0">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              LV: 56
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs md:text-sm">@{profileUsername}</p>
                          <p className="text-xs md:text-sm mt-1">{profileBio}</p>
                        </div>
                        <Button variant="outline" className="gap-2 w-full sm:w-fit text-xs md:text-sm" onClick={() => setIsEditMode(true)}>
                          <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                          Edit Profile
                        </Button>
                      </div>
                      
                      {/* Level Progress Bar */}
                      <div className="bg-muted/50 rounded-lg p-3 md:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">Level 56</span>
                          </div>
                          <span className="text-xs text-muted-foreground">2,450 / 3,000 XP</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: '82%' }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">550 XP more to reach Level 57</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notification Section */}
              {(activeTab === "account" || activeTab === "notification") && (
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className="w-4 h-4 md:w-5 md:h-5" />
                      <h3 className="text-base md:text-lg font-semibold">Notification</h3>
                    </div>
                    <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
                      Control how you receive notifications.
                    </p>
                    <Separator className="mb-3 md:mb-4" />
                    
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-sm md:text-base">Email Notification</p>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">Receive updates via email</p>
                        </div>
                        <Switch
                          checked={emailNotification}
                          onCheckedChange={setEmailNotification}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-sm md:text-base">In-game Notification</p>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">Show alerts during gameplay</p>
                        </div>
                        <Switch
                          checked={inGameNotification}
                          onCheckedChange={setInGameNotification}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preferences Section */}
              {(activeTab === "account" || activeTab === "preferences") && (
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Smile className="w-4 h-4 md:w-5 md:h-5" />
                      <h3 className="text-base md:text-lg font-semibold">Preferences</h3>
                    </div>
                    <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
                      Customize your gameplay experience
                    </p>
                    <Separator className="mb-3 md:mb-4" />
                    
                    <div className="space-y-4 md:space-y-6">
                      <div>
                        <p className="font-medium mb-2 text-sm md:text-base">Language</p>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="bg-muted text-sm md:text-base">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="thai">ไทย</SelectItem>
                            <SelectItem value="japanese">日本語</SelectItem>
                            <SelectItem value="korean">한국어</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-sm md:text-base">Game Audio</p>
                          <p className="text-xs md:text-sm text-muted-foreground">Enable game audio</p>
                        </div>
                        <Switch
                          checked={gameAudio}
                          onCheckedChange={setGameAudio}
                        />
                      </div>
                      
                      <div>
                        <p className="font-medium mb-2 md:mb-3 text-sm md:text-base">Background Music</p>
                        <Slider
                          value={backgroundMusic}
                          onValueChange={setBackgroundMusic}
                          max={100}
                          step={1}
                          disabled={!gameAudio}
                        />
                      </div>
                      
                      <div>
                        <p className="font-medium mb-2 md:mb-3 text-sm md:text-base">Sound Effect</p>
                        <Slider
                          value={soundEffect}
                          onValueChange={setSoundEffect}
                          max={100}
                          step={1}
                          disabled={!gameAudio}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
