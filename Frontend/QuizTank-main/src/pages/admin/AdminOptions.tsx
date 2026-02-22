import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

const AdminOptions = () => {
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const data = await adminService.getOptions();
            const sortedData = [...data].sort((a, b) => a.key.localeCompare(b.key));
            setOptions(sortedData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load options');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateValue = (key: string, index: number, value: string) => {
        setOptions(prev => prev.map(opt => {
            if (opt.key === key) {
                const newValue = [...opt.value];
                newValue[index] = value;
                return { ...opt, value: newValue };
            }
            return opt;
        }));
    };

    const handleAddItem = (key: string) => {
        setOptions(prev => prev.map(opt => {
            if (opt.key === key) {
                return { ...opt, value: [...opt.value, ''] };
            }
            return opt;
        }));
    };

    const handleRemoveItem = (key: string, index: number) => {
        setOptions(prev => prev.map(opt => {
            if (opt.key === key) {
                return { ...opt, value: opt.value.filter((_: any, i: number) => i !== index) };
            }
            return opt;
        }));
    };

    const handleMoveItem = (key: string, index: number, direction: 'up' | 'down') => {
        setOptions(prev => prev.map(opt => {
            if (opt.key === key) {
                const newValue = [...opt.value];
                const newIndex = direction === 'up' ? index - 1 : index + 1;
                if (newIndex >= 0 && newIndex < newValue.length) {
                    [newValue[index], newValue[newIndex]] = [newValue[newIndex], newValue[index]];
                    return { ...opt, value: newValue };
                }
            }
            return opt;
        }));
    };

    const handleSave = async (key: string, value: any) => {
        setSaving(key);
        try {
            await adminService.updateOption(key, value);
            toast.success(`${key} updated successfully`);
        } catch (error) {
            console.error(error);
            toast.error(`Failed to update ${key}`);
        } finally {
            setSaving(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading options...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage global system settings and list values.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {options.map((option) => (
                    <Card key={option.key}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                            <div className="space-y-1">
                                <p className="capitalize text-2xl font-bold">{option.key}</p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => handleSave(option.key, option.value)}
                                disabled={saving === option.key}
                            >
                                {saving === option.key ? 'Saving...' : 'Save'}
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {option.value.map((item: string, index: number) => (
                                    <div key={index} className="flex gap-2 group">
                                        <div className="flex flex-col">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 rounded-none"
                                                disabled={index === 0}
                                                onClick={() => handleMoveItem(option.key, index, 'up')}
                                            >
                                                <ChevronUp className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 rounded-none"
                                                disabled={index === option.value.length - 1}
                                                onClick={() => handleMoveItem(option.key, index, 'down')}
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Input
                                            value={item}
                                            onChange={(e) => handleUpdateValue(option.key, index, e.target.value)}
                                            placeholder={`Value ${index + 1}`}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveItem(option.key, index)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                className="w-full border-dashed"
                                onClick={() => handleAddItem(option.key)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminOptions;
