import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { mapService, MapData } from '@/services/mapService';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { MediaUpload } from "@/components/games/MediaUpload";
import { gameService } from "@/services/gameService";

interface MediaFile {
    id: string;
    url: string;
    type: "image" | "video";
    name: string;
}

const AdminMapForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<MapData>>({
        name: '',
        description: '',
        image_url: '',
        status: 1 // Default to 1 (active)
    });

    const [coverImage, setCoverImage] = useState<MediaFile[]>([]);

    useEffect(() => {
        if (isEditMode && id) {
            const fetchMap = async () => {
                try {
                    setLoading(true);
                    const data = await mapService.getMapById(parseInt(id));
                    setFormData(data);
                    if (data.image_url) {
                        setCoverImage([{
                            id: 'cover',
                            url: data.image_url,
                            type: 'image',
                            name: 'cover'
                        }]);
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('Failed to load map details');
                    navigate('/admin/maps');
                } finally {
                    setLoading(false);
                }
            };
            fetchMap();
        }
    }, [isEditMode, id, navigate]);

    useEffect(() => {
        if (coverImage.length > 0) {
            setFormData(prev => ({ ...prev, image_url: coverImage[0].url }));
        } else {
            setFormData(prev => ({ ...prev, image_url: '' }));
        }
    }, [coverImage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMediaUpload = async (file: File) => {
        try {
            const data = await gameService.uploadMedia(file);
            if (data.success && data.url) {
                return data.url;
            }
            throw new Error("Invalid response from server");
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Failed to upload media");
            throw error;
        }
    };

    const handleStatusChange = (value: string) => {
        setFormData(prev => ({ ...prev, status: parseInt(value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Map name is required');
            return;
        }

        try {
            setLoading(true);
            if (isEditMode && id) {
                await mapService.updateMap(parseInt(id), formData);
                toast.success('Map updated successfully');
            } else {
                await mapService.createMap(formData);
                toast.success('Map created successfully');
            }

            if (!isEditMode) {
                navigate('/admin/maps');
            }
        } catch (error) {
            console.error(error);
            toast.error(isEditMode ? 'Failed to update map' : 'Failed to create map');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <div className="p-8 text-center text-muted-foreground">Loading map details...</div>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/maps')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditMode ? 'Edit Map' : 'Create Map'}
                    </h1>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image_url">Cover Image</Label>
                            <MediaUpload
                                files={coverImage}
                                onChange={setCoverImage}
                                maxFiles={1}
                                accept="image/*"
                                placeholder="Click to upload cover image"
                                onUpload={handleMediaUpload}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={String(formData.status)}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="2">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading}>
                                Save
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminMapForm;
