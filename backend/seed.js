/*Seed Script — populates MongoDB with sample data for testing.
 *Run: node seed.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

// ─── Models (inline to keep seed self-contained) ─────────────────────────────
const userSchema = new mongoose.Schema(
    {
        channelName: String,
        userName: { type: String, unique: true },
        email: { type: String, unique: true },
        password: String,
        about: String,
        profilePic: String,
    },
    { timestamps: true }
);
const User = mongoose.model('User', userSchema);

const videoSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        title: String,
        description: String,
        videoLink: String,
        thumbnail: String,
        videoType: { type: String, default: 'All' },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        views: { type: Number, default: 0 },
    },
    { timestamps: true }
);
const Video = mongoose.model('Video', videoSchema);

const commentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
        message: String,
    },
    { timestamps: true }
);
const Comment = mongoose.model('Comment', commentSchema);

// ─── Seed Data ────────────────────────────────────────────────────────────────
const AVATARS = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
];

const THUMBNAILS = {
    Music:    'https://picsum.photos/seed/music/640/360',
    Gaming:   'https://picsum.photos/seed/gaming/640/360',
    News:     'https://picsum.photos/seed/news/640/360',
    Sports:   'https://picsum.photos/seed/sports/640/360',
    Education:'https://picsum.photos/seed/edu/640/360',
    Travel:   'https://picsum.photos/seed/travel/640/360',
    Comedy:   'https://picsum.photos/seed/comedy/640/360',
    All:      'https://picsum.photos/seed/all/640/360',
};

// Public domain / freely embeddable sample video URLs
const SAMPLE_VIDEO_URL =
    'https://www.w3schools.com/html/mov_bbb.mp4';

const usersData = [
    { channelName: 'Code With John',    userName: 'JohnDoe',   email: 'john@example.com',  about: 'Coding tutorials and tech reviews.',      profilePic: AVATARS[0] },
    { channelName: 'Music Central',     userName: 'MusicFan',  email: 'music@example.com', about: 'All genres of music, every day.',          profilePic: AVATARS[1] },
    { channelName: 'GameZone Pro',      userName: 'GamerPro',  email: 'game@example.com',  about: 'Gaming walkthroughs and reviews.',         profilePic: AVATARS[2] },
    { channelName: 'Daily News Hub',    userName: 'NewsGuy',   email: 'news@example.com',  about: 'Breaking news and analysis.',              profilePic: AVATARS[3] },
    { channelName: 'Travel With Sarah', userName: 'TravelSarah',email:'sarah@example.com', about: 'Exploring the world one destination at a time.', profilePic: AVATARS[4] },
];

const videosData = [
    { title: 'Learn React in 30 Minutes',         description: 'A quick tutorial to get started with React hooks and components.', videoType: 'Education', views: 15200 },
    { title: 'Top 10 JavaScript Tips',            description: 'Improve your JavaScript skills with these pro tips.',              videoType: 'Education', views: 8900  },
    { title: 'Full Node.js Crash Course',         description: 'Build REST APIs from scratch using Node.js and Express.',          videoType: 'Education', views: 22000 },
    { title: 'Best Chill Beats 2024',             description: 'Relax and study with these lo-fi beats.',                          videoType: 'Music',     views: 45000 },
    { title: 'Top Hits This Week',                description: 'The hottest tracks trending this week.',                            videoType: 'Music',     views: 31000 },
    { title: 'Guitar Basics for Beginners',       description: 'Learn your first chords in under 20 minutes.',                     videoType: 'Music',     views: 12400 },
    { title: 'Minecraft Survival Guide 2024',     description: 'Complete guide to surviving your first night in Minecraft.',        videoType: 'Gaming',    views: 67000 },
    { title: 'GTA 6 First Impressions',           description: 'Our honest take on the most anticipated game of the decade.',       videoType: 'Gaming',    views: 210000},
    { title: 'Elden Ring Boss Tier List',         description: 'We rank every boss in Elden Ring from easiest to hardest.',         videoType: 'Gaming',    views: 54000 },
    { title: 'Breaking: Economy Update',          description: 'Latest developments in global markets and what they mean for you.', videoType: 'News',      views: 9800  },
    { title: 'Tech Giants Under Scrutiny',        description: 'AI regulation and its impact on big tech.',                         videoType: 'News',      views: 7600  },
    { title: 'FIFA World Cup Highlights',         description: 'Best goals and moments from this year\'s World Cup.',               videoType: 'Sports',    views: 88000 },
    { title: 'NBA Finals Game 7 Recap',           description: 'Everything you missed from the most thrilling finale in years.',    videoType: 'Sports',    views: 120000},
    { title: 'Exploring Tokyo on $50/day',        description: 'Budget travel guide to Japan\'s capital city.',                     videoType: 'Travel',    views: 34000 },
    { title: 'Hidden Gems of Southeast Asia',     description: 'Off-the-beaten-path destinations you need to visit.',               videoType: 'Travel',    views: 29000 },
    { title: 'Stand-Up Comedy Special',           description: 'Hilarious stand-up set — warning: you will laugh.',                 videoType: 'Comedy',    views: 73000 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/youtubeClone');
        console.log('Connected to MongoDB');

        // Clear existing data
        await Promise.all([User.deleteMany(), Video.deleteMany(), Comment.deleteMany()]);
        console.log('Cleared existing data');

        // Create users
        const hashedPw = await bcrypt.hash('password123', 12);
        const createdUsers = await User.insertMany(
        usersData.map((u) => ({ ...u, password: hashedPw }))
        );
        console.log(`Created ${createdUsers.length} users`);

        // Create videos — distribute across users
        const createdVideos = await Video.insertMany(
        videosData.map((v, i) => ({
            ...v,
            user: createdUsers[i % createdUsers.length]._id,
            videoLink: SAMPLE_VIDEO_URL,
            thumbnail: `${THUMBNAILS[v.videoType] || THUMBNAILS['All']}?v=${i}`,
        }))
        );
        console.log(`Created ${createdVideos.length} videos`);

        // Create sample comments
        const commentMessages = [
        'Great video! Very helpful.',
        'Love this content, keep it up!',
        'This is exactly what I was looking for.',
        'Can you make more videos like this?',
        'Amazing quality, subscribed!',
        'Thanks for sharing this.',
        ];
        const commentsToInsert = createdVideos.slice(0, 8).flatMap((video, vi) =>
        commentMessages.slice(0, 3).map((msg, ci) => ({
            user: createdUsers[(vi + ci) % createdUsers.length]._id,
            video: video._id,
            message: msg,
        }))
        );
        await Comment.insertMany(commentsToInsert);
        console.log(`Created ${commentsToInsert.length} comments`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest credentials (all users share same password):');
        createdUsers.forEach((u) =>
        console.log(`  Username: ${u.userName} | Email: ${u.email} | Password: password123`)
        );
    } catch (err) {
        console.error('Seed error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

seed();
