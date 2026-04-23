const gameRoomModel = require('../models/gameRoomModel');
const gameReportModel = require('../models/gameReportModel');
const OptionModel = require('../models/optionModel');

/**
 * Game Room Controller - Simplified API for game_rooms table
 */

// Create a new game
const createGame = async (req, res) => {
    try {
        const userId = req.user.id;
        const gameData = req.body;

        // Validate required fields
        if (!gameData.name || gameData.name.trim() === '') {
            return res.status(400).json({ error: 'Game name is required' });
        }

        const { id, gameCode } = await gameRoomModel.create(userId, gameData);

        res.status(201).json({
            success: true,
            message: 'Game created successfully',
            gameId: id,
            gameCode: gameCode
        });
    } catch (error) {
        console.error('Create Game Error:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
};

// Get game by ID or Code
const getGameById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : null;

        let game;
        // Check if input is likely a Game ID (numeric) or Game Code (alphanumeric)
        if (/^\d+$/.test(id)) {
            game = await gameRoomModel.getById(id, userId);
        } else {
            game = await gameRoomModel.getByCode(id, userId);
        }

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        // Format response for frontend
        const response = {
            id: game.id,
            name: game.name,
            status: game.status,
            visibility: game.visibility,
            is_unlocked: game.is_unlocked,
            category: game.category,
            language: game.language,
            tags: game.tags || [],
            description: game.description,
            cover_image: game.cover_image,
            questions: game.questions || [],
            knowledges: game.knowledges || [],
            duration: game.duration,
            enemies: game.enemies,
            hearts: game.hearts,
            brains: game.brains,
            initial_ammo: game.initial_ammo,
            ammo_per_correct: game.ammo_per_correct,
            questions_order: game.questions_order,
            knowledges_order: game.knowledges_order,

            map: game.map,
            map_data: game.map_data,
            map_music_url: game.map_music_url || null,
            creator_name: game.creator_name,
            creator_full_name: game.creator_full_name,
            creator_avatar: game.creator_avatar,
            ai_generated: !!game.ai_generated,
            game_code: game.game_code,
            created_at: game.created_at,
            created_at: game.created_at,
            updated_at: game.updated_at,
            rating: game.rating || 0,
            rating_count: game.rating_count || 0,
            favorites_count: game.favorites_count || 0,
            user_id: game.user_id
        };

        // Include password only if the requester is the creator
        if (req.user && String(req.user.id) === String(game.user_id)) {
            response.password = game.password;
        }

        res.json(response);
    } catch (error) {
        console.error('Get Game Error:', error);
        res.status(500).json({ error: 'Failed to get game' });
    }
};

// Get user's games (My Games)
const getMyGames = async (req, res) => {
    try {
        const userId = req.user.id;
        const games = await gameRoomModel.getByUserId(userId);

        // Format for frontend
        const formatted = games.map(g => ({
            id: g.id,
            name: g.name,
            status: g.status,
            visibility: g.visibility,
            category: g.category,
            tags: g.tags || [],
            cover_image: g.cover_image,
            questionCount: (g.questions || []).length,
            knowledgeCount: (g.knowledges || []).length,
            duration: g.duration,
            created_at: g.created_at,
            updated_at: g.updated_at,
            password: g.password,
            created_at: g.created_at,
            updated_at: g.updated_at,
            password: g.password,
            gameCode: g.game_code,
            rating: g.rating || 0,
            rating_count: g.rating_count || 0,
            play_count: g.play_count || 0
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get My Games Error:', error);
        res.status(500).json({ error: 'Failed to get games' });
    }
};

// Get public games
const getPublicGames = async (req, res) => {
    try {
        const { limit = 20, offset = 0, sortBy, category, difficulty, isAi } = req.query;
        const userId = req.user ? req.user.id : null;
        const games = await gameRoomModel.getPublicGames(parseInt(limit), parseInt(offset), userId, sortBy, category, difficulty, isAi);

        const formatted = games.map(g => ({
            id: g.id,
            name: g.name,
            category: g.category,
            tags: g.tags || [],
            description: g.description,
            cover_image: g.cover_image,
            questions: g.questions,
            knowledges: g.knowledges,
            enemies: g.enemies,
            hearts: g.hearts,
            brains: g.brains,
            initial_ammo: g.initial_ammo,
            ammo_per_correct: g.ammo_per_correct,
            duration: g.duration,
            creator_name: g.creator_name,
            created_at: g.created_at,
            is_favourite: !!g.is_favourite,
            ai_generated: !!g.ai_generated,
            is_favourite: !!g.is_favourite,
            ai_generated: !!g.ai_generated,
            gameCode: g.game_code,
            rating: g.rating || 0,
            rating_count: g.rating_count || 0,
            play_count: g.play_count || 0
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get Public Games Error:', error);
        res.status(500).json({ error: 'Failed to get games' });
    }
};

// Search games
const searchGames = async (req, res) => {
    try {
        const { q, limit = 20, offset = 0, sortBy, category, difficulty } = req.query;

        if (!q || q.trim() === '') {
            return res.json([]);
        }

        const userId = req.user ? req.user.id : null;
        const games = await gameRoomModel.search(q, parseInt(limit), userId, parseInt(offset), sortBy, category, difficulty);

        const formatted = games.map(g => ({
            id: g.id,
            name: g.name,
            category: g.category,
            tags: g.tags || [],
            description: g.description,
            cover_image: g.cover_image,
            questions: g.questions,
            knowledges: g.knowledges,
            enemies: g.enemies,
            hearts: g.hearts,
            brains: g.brains,
            initial_ammo: g.initial_ammo,
            ammo_per_correct: g.ammo_per_correct,
            duration: g.duration,
            creator_name: g.creator_name,
            created_at: g.created_at,
            is_favourite: !!g.is_favourite,
            ai_generated: !!g.ai_generated,
            is_favourite: !!g.is_favourite,
            ai_generated: !!g.ai_generated,
            gameCode: g.game_code,
            rating: g.rating || 0,
            rating_count: g.rating_count || 0,
            play_count: g.play_count || 0
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Search Games Error:', error);
        res.status(500).json({ error: 'Failed to search games' });
    }
};

// Get related games
const getRelatedGames = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 8 } = req.query;
        const userId = req.user ? req.user.id : null;

        const games = await gameRoomModel.getRelated(id, parseInt(limit), userId);

        const formatted = games.map(g => ({
            id: g.id,
            title: g.name,
            name: g.name,
            description: g.description,
            image: g.cover_image,
            category: g.category,
            tags: g.tags,

            // Stats for difficulty calculation
            questions: g.questions,
            knowledges: g.knowledges,
            enemies: g.enemies,
            hearts: g.hearts,
            brains: g.brains,
            initial_ammo: g.initial_ammo,
            ammo_per_correct: g.ammo_per_correct,
            duration: g.duration,

            xp: 100, // Placeholder
            rating: g.rating || 0,
            rating_count: g.rating_count || 0,
            play_count: g.play_count || 0,
            difficulty: "Medium", // Fallback
            creator_name: g.creator_name,
            isFavourite: !!g.is_favourite,
            ai_generated: !!g.ai_generated,
            gameCode: g.game_code
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get Related Games Error:', error);
        res.status(500).json({ error: 'Failed to get related games' });
    }
};

// Update game
const updateGame = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const gameData = req.body;

        // Fetch current state BEFORE update to check for changes
        const currentGame = await gameRoomModel.getById(id);

        const result = await gameRoomModel.update(id, userId, gameData);

        if (!result) {
            return res.status(404).json({ error: 'Game not found or not authorized' });
        }

        // Determine if we need to revoke access
        let shouldRevoke = false;

        // 1. Password changed
        if (gameData.password !== undefined && currentGame && gameData.password !== currentGame.password) {
            shouldRevoke = true;
        }

        // 2. Visibility changed to Public (1) or Private (2)
        if (gameData.visibility !== undefined) {
            const newVis = parseInt(gameData.visibility);
            if (newVis === 1 || newVis === 2) {
                shouldRevoke = true;
            }
        }

        if (shouldRevoke) {
            await gameRoomModel.revokeAllAccess(id);
        }

        res.json({
            success: true,
            message: 'Game updated successfully',
            gameId: result.id
        });
    } catch (error) {
        console.error('Update Game Error:', error);
        res.status(500).json({ error: 'Failed to update game' });
    }
};

// Delete game (soft delete)
const deleteGame = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await gameRoomModel.delete(id, userId);

        if (!result) {
            return res.status(404).json({ error: 'Game not found or not authorized' });
        }

        res.json({
            success: true,
            message: 'Game deleted successfully'
        });
    } catch (error) {
        console.error('Delete Game Error:', error);
        res.status(500).json({ error: 'Failed to delete game' });
    }
};

// Get recent games
const getRecentGames = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const games = await gameRoomModel.getRecent(parseInt(limit));

        const formatted = games.map(g => ({
            id: g.id,
            name: g.name,
            category: g.category,
            tags: g.tags || [],
            cover_image: g.cover_image,
            questionCount: (g.questions || []).length,
            duration: g.duration,
            creator_name: g.creator_name,
            ai_generated: !!g.ai_generated
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get Recent Games Error:', error);
        res.status(500).json({ error: 'Failed to get recent games' });
    }
};

// Get trending games
const getTrendingGames = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const games = await gameRoomModel.getTrending(parseInt(limit));

        const formatted = games.map(g => ({
            id: g.id,
            name: g.name,
            category: g.category,
            tags: g.tags || [],
            cover_image: g.cover_image,
            questionCount: (g.questions || []).length,
            duration: g.duration,
            creator_name: g.creator_name,
            ai_generated: !!g.ai_generated
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get Trending Games Error:', error);
        res.status(500).json({ error: 'Failed to get trending games' });
    }
};

const verifyPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        const isValid = await gameRoomModel.verifyPassword(id, password);

        if (isValid) {
            if (req.user && req.user.id) {
                await gameRoomModel.unlockGame(req.user.id, id);
            }
            res.json({ success: true, message: 'Password verified' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getUserGames = async (req, res) => {
    try {
        const { username } = req.params;
        const { limit = 20, offset = 0, sortBy, category, difficulty, q } = req.query;
        const userId = req.user ? req.user.id : null;
        const games = await gameRoomModel.getByUsername(username, userId, parseInt(limit), parseInt(offset), sortBy, category, q, difficulty);

        const formatted = games.map(g => ({
            id: g.id,
            name: g.name,
            category: g.category,
            tags: g.tags || [],
            description: g.description,
            cover_image: g.cover_image,
            questions: g.questions,
            knowledges: g.knowledges,
            enemies: g.enemies,
            hearts: g.hearts,
            brains: g.brains,
            initial_ammo: g.initial_ammo,
            ammo_per_correct: g.ammo_per_correct,
            duration: g.duration,
            creator_name: g.creator_name,
            created_at: g.created_at,
            is_favourite: !!g.is_favourite,
            ai_generated: !!g.ai_generated,
            gameCode: g.game_code,
            rating: g.rating || 0,
            rating_count: g.rating_count || 0,
            play_count: g.play_count || 0
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get User Games Error:', error);
        res.status(500).json({ error: 'Failed to get user games' });
    }
};

// Report a game
const reportGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const report = await gameReportModel.create(userId, id, reason);
        res.status(201).json(report);
    } catch (error) {
        console.error('Report Game Error:', error);
        res.status(500).json({ error: 'Failed to report game' });
    }
};

// Check report status
const checkReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : null;

        if (!userId) {
            return res.json({ reported: false });
        }

        const reported = await gameReportModel.checkExisting(userId, id);
        res.json({ reported });
    } catch (error) {
        console.error('Check Report Status Error:', error);
        res.status(500).json({ error: 'Failed to check report status' });
    }
};

// Generate game with AI
const generateWithAI = async (req, res) => {
    const AIGEN_URL = process.env.AIGEN_URL || 'http://localhost:8000';
    const MAX_RETRIES = 5;

    const validateQuizStructure = (data) => {
        // Define allowed fields for each structure
        const ALLOWED_TOP_LEVEL = ['status', 'name', 'category', 'language', 'tags', 'description', 'questions', 'knowledges', 'duration', 'enemies', 'hearts', 'brains'];
        const ALLOWED_QUESTION_CHOICE = ['type', 'question', 'choices'];
        const ALLOWED_QUESTION_FILL = ['type', 'question', 'answers'];
        const ALLOWED_CHOICE = ['content', 'correct'];
        const ALLOWED_KNOWLEDGE = ['content'];

        // Helper to check for excess fields
        const hasExcessFields = (obj, allowed) => {
            return Object.keys(obj).some(key => !allowed.includes(key));
        };

        // Check for excess top-level fields
        if (hasExcessFields(data, ALLOWED_TOP_LEVEL)) {
            console.log('Excess top-level fields detected');
            return false;
        }

        // Check required top-level fields
        if (!data.name || typeof data.name !== 'string') return false;
        if (!data.category || typeof data.category !== 'string') return false;
        if (!data.language || typeof data.language !== 'string') return false;
        if (!data.description || typeof data.description !== 'string') return false;
        if (!Array.isArray(data.tags)) return false;
        if (!Array.isArray(data.questions) || data.questions.length === 0) return false;
        if (!Array.isArray(data.knowledges)) return false;

        // Validate questions
        for (const q of data.questions) {
            if (typeof q.type !== 'number' || ![1, 2, 3].includes(q.type)) return false;
            if (!q.question || typeof q.question !== 'string') return false;

            if (q.type === 1 || q.type === 2) {
                // Check for excess fields in choice questions
                if (hasExcessFields(q, ALLOWED_QUESTION_CHOICE)) {
                    console.log('Excess fields in choice question detected:', Object.keys(q));
                    return false;
                }
                // Single or Multiple choice
                if (!Array.isArray(q.choices) || q.choices.length < 2) return false;
                const correctCount = q.choices.filter(c => c.correct === 1).length;
                if (q.type === 1 && correctCount !== 1) return false;
                if (q.type === 2 && correctCount < 2) return false;

                // Check for excess fields in choices
                for (const c of q.choices) {
                    if (hasExcessFields(c, ALLOWED_CHOICE)) {
                        console.log('Excess fields in choice detected:', Object.keys(c));
                        return false;
                    }
                }
            } else if (q.type === 3) {
                // Check for excess fields in fill questions
                if (hasExcessFields(q, ALLOWED_QUESTION_FILL)) {
                    console.log('Excess fields in fill question detected:', Object.keys(q));
                    return false;
                }
                // Fill-in
                if (!Array.isArray(q.answers) || q.answers.length === 0) return false;
            }
        }

        // Validate knowledges
        for (const k of data.knowledges) {
            if (hasExcessFields(k, ALLOWED_KNOWLEDGE)) {
                console.log('Excess fields in knowledge detected:', Object.keys(k));
                return false;
            }
            if (!k.content || typeof k.content !== 'string') return false;
        }

        return true;
    };

    try {
        const { prompt, categories, languages } = req.body;
        const userId = req.user.id;

        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Default lists if not provided
        const categoryList = Array.isArray(categories) && categories.length > 0 ? categories : ['General'];
        const languageList = Array.isArray(languages) && languages.length > 0 ? languages : ['English'];

        let lastError = null;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                // Call AIGEN service with categories and languages
                const response = await fetch(`${AIGEN_URL}/generate-quiz`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, categories: categoryList, languages: languageList })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`AIGEN service error: ${errorText}`);
                }

                const aiData = await response.json();

                // Check AI response status
                if (aiData.status === 0 || aiData.status === 2) {
                    // Invalid prompt or error message from AI
                    return res.status(400).json({
                        success: false,
                        message: aiData.message || 'AI could not generate content for this prompt'
                    });
                }

                // Validate structure for status === 1
                if (aiData.status === 1) {
                    if (!validateQuizStructure(aiData)) {
                        console.log(`Attempt ${attempt}: Invalid structure, retrying...`);
                        lastError = 'Invalid JSON structure from AI';
                        continue; // Retry
                    }

                    // Validate language is in the allowed list
                    if (!languageList.some(lang => lang.toLowerCase() === aiData.language.toLowerCase())) {
                        console.log(`Attempt ${attempt}: Invalid language "${aiData.language}", retrying...`);
                        lastError = `Invalid language from AI: ${aiData.language}`;
                        continue; // Retry
                    }

                    // Validate category is in the allowed list
                    if (!categoryList.some(cat => cat.toLowerCase() === aiData.category.toLowerCase())) {
                        console.log(`Attempt ${attempt}: Invalid category "${aiData.category}", retrying...`);
                        lastError = `Invalid category from AI: ${aiData.category}`;
                        continue; // Retry
                    }

                    // Valid! Create the game with preset settings
                    const numQuestions = aiData.questions.length;
                    const calculatedDuration = Math.max(3, Math.min(30, Math.floor(numQuestions / 2)));

                    let defaultMapId = 0;
                    try {
                        const mapOption = await OptionModel.getByKey('map_id');
                        if (mapOption && mapOption.value) {
                            defaultMapId = parseInt(mapOption.value);
                        }
                    } catch (err) {
                        console.error('Error fetching default map_id option:', err);
                    }

                    const gameData = {
                        name: aiData.name,
                        category: aiData.category,
                        language: aiData.language,
                        tags: aiData.tags,
                        description: aiData.description,
                        status: 2,
                        visibility: 1,
                        ai_generated: 1,
                        initial_ammo: 1,
                        ammo_per_correct: 2,
                        map: defaultMapId,
                        duration: calculatedDuration,
                        enemies: numQuestions,
                        hearts: 5,
                        brains: 5,
                        questions: aiData.questions,
                        knowledges: aiData.knowledges
                    };

                    const { id, gameCode } = await gameRoomModel.create(userId, gameData);

                    return res.status(201).json({
                        success: true,
                        message: 'Game generated successfully',
                        gameId: id,
                        gameCode: gameCode
                    });
                }

                // Unknown status
                lastError = 'Unexpected AI response';

            } catch (fetchError) {
                console.error(`Attempt ${attempt} failed:`, fetchError.message);
                lastError = fetchError.message;
            }
        }

        // All retries failed
        res.status(500).json({
            success: false,
            error: 'Failed to generate game after multiple attempts',
            details: lastError
        });

    } catch (error) {
        console.error('Generate With AI Error:', error);
        res.status(500).json({ error: 'Failed to generate game with AI' });
    }
};

// Generate edit with AI
const generateEditWithAI = async (req, res) => {
    const AIGEN_URL = process.env.AIGEN_URL || 'http://localhost:8000';
    const MAX_RETRIES = 5;

    // Helper validation (duplicated for isolation)
    // Helper validation (duplicated for isolation)
    const validateQuizStructure = (data) => {
        // Log validation errors for debugging
        const logError = (msg, obj) => console.log(`[Validation Error] ${msg}`, obj);

        // Required top-level fields
        if (!data.name || typeof data.name !== 'string') { logError('Invalid name'); return false; }
        if (!data.category || typeof data.category !== 'string') { logError('Invalid category'); return false; }
        if (!data.language || typeof data.language !== 'string') { logError('Invalid language'); return false; }
        if (!data.description || typeof data.description !== 'string') { logError('Invalid description'); return false; }
        if (!Array.isArray(data.tags)) { logError('Invalid tags'); return false; }
        if (!Array.isArray(data.questions) || data.questions.length === 0) { logError('Invalid questions array'); return false; }
        if (!Array.isArray(data.knowledges)) { logError('Invalid knowledges array'); return false; }

        // Validate questions
        for (const q of data.questions) {
            if (typeof q.type !== 'number' || ![1, 2, 3].includes(q.type)) { logError('Invalid question type', q); return false; }
            if (!q.question || typeof q.question !== 'string') { logError('Invalid question text', q); return false; }

            if (q.type === 1 || q.type === 2) {
                if (!Array.isArray(q.choices) || q.choices.length < 2) { logError('Invalid choices length', q); return false; }
                const correctCount = q.choices.filter(c => c.correct === 1).length;
                if (q.type === 1 && correctCount !== 1) { logError('Type 1 requires exactly 1 correct', q); return false; }
                if (q.type === 2 && correctCount < 2) { logError('Type 2 requires >= 2 correct', q); return false; }

                for (const c of q.choices) {
                    // Check required choice fields
                    if (!c.hasOwnProperty('content') || typeof c.content !== 'string') { logError('Choice content missing/invalid', c); return false; }
                    if (!c.hasOwnProperty('correct') || typeof c.correct !== 'number') { logError('Choice correct missing/invalid', c); return false; }
                }
            } else if (q.type === 3) {
                if (!Array.isArray(q.answers) || q.answers.length === 0) { logError('Type 3 missing answers', q); return false; }
            }
        }

        // Validate knowledges
        for (const k of data.knowledges) {
            if (!k.content || typeof k.content !== 'string') { logError('Invalid knowledge content', k); return false; }
        }

        return true;
    };

    try {
        const { gameId, prompt, categories, languages } = req.body;
        const userId = req.user.id;

        if (!gameId) return res.status(400).json({ error: 'Game ID is required' });
        if (!prompt || prompt.trim() === '') return res.status(400).json({ error: 'Prompt is required' });

        // Fetch existing game
        const game = await gameRoomModel.getById(gameId, userId);
        if (!game) return res.status(404).json({ error: 'Game not found' });

        // Check ownership
        if (game.user_id !== userId) return res.status(403).json({ error: 'Unauthorized' });

        // Prepare existing data for AI (clean up to match expected format)
        const cleanQuestions = (game.questions || []).map(q => {
            const cleanQ = {
                type: q.type,
                question: q.question
            };
            if (q.type === 3) {
                cleanQ.answers = q.answers || [];
            } else {
                cleanQ.choices = (q.choices || []).map(c => ({
                    content: c.content || c.text, // Handle potential field name diffs
                    correct: c.correct || (c.isCorrect ? 1 : 0)
                }));
            }
            return cleanQ;
        });

        const cleanKnowledges = (game.knowledges || []).map(k => ({
            content: k.content
        }));

        const existingData = {
            status: 1, // Start with valid status
            name: game.name || "",
            category: game.category || "",
            language: game.language || "",
            tags: game.tags || [],
            description: game.description || "",
            questions: cleanQuestions,
            knowledges: cleanKnowledges,
            duration: game.duration || 4,
            enemies: game.enemies || 2,
            hearts: game.hearts || 3,
            brains: game.brains || 4
        };

        // Default lists
        const categoryList = Array.isArray(categories) && categories.length > 0 ? categories : ['General'];
        const languageList = Array.isArray(languages) && languages.length > 0 ? languages : ['English'];

        let lastError = null;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await fetch(`${AIGEN_URL}/generate-quiz`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt,
                        categories: categoryList,
                        languages: languageList,
                        existing_data: existingData
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`AIGEN service error: ${errorText}`);
                }

                const aiData = await response.json();

                if (aiData.status === 0 || aiData.status === 2) {
                    return res.status(400).json({
                        success: false,
                        message: aiData.message || 'AI could not generate content'
                    });
                }

                if (aiData.status === 1) {
                    if (!validateQuizStructure(aiData)) {
                        console.log(`Attempt ${attempt}: Invalid structure`);
                        lastError = 'Invalid JSON structure from AI';
                        continue;
                    }

                    if (!languageList.some(lang => lang.toLowerCase() === aiData.language.toLowerCase())) {
                        lastError = `Invalid language: ${aiData.language}`;
                        continue;
                    }

                    if (!categoryList.some(cat => cat.toLowerCase() === aiData.category.toLowerCase())) {
                        lastError = `Invalid category: ${aiData.category}`;
                        continue;
                    }

                    // Use old values from the database, ignore what AI sent
                    aiData.duration = game.duration;
                    aiData.enemies = game.enemies;
                    aiData.hearts = game.hearts;
                    aiData.brains = game.brains;

                    // Return stringified JSON for preview/confirmation
                    return res.status(200).json({
                        success: true,
                        generatedData: aiData
                    });
                }
            } catch (err) {
                console.error(`Attempt ${attempt} failed:`, err.message);
                lastError = err.message;
            }
        }

        res.status(500).json({
            success: false,
            error: 'Failed to generate edit with AI',
            details: lastError
        });

    } catch (error) {
        console.error('Generate Edit With AI Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createGame,
    getGameById,
    getMyGames,
    getPublicGames,
    searchGames,
    getRelatedGames,
    updateGame,
    deleteGame,
    getRecentGames,
    getTrendingGames,
    verifyPassword,
    getUserGames,
    reportGame,
    checkReportStatus,
    generateWithAI,
    generateEditWithAI
};
