export type Story = {
    id: number;
    time: number;
    by: string;
    kids: number[];
    score: number;
    title: string;
    url: string;
    commentCount: number;
}

export type Comment = {
    id: number;
    time: number;
    by: string;
    text: string;
    kids: number[];
    selected: boolean;
}

export function idFromUrl(url: string): number {
    return parseInt(url.split('=')[1]);
}

export async function getStory(id: number): Promise<Story> {
    const request = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    const response = await request.json();

    return {
        id: response.id,
        time: response.time,
        by: response.by,
        kids: response.kids,
        score: response.score,
        title: response.title,
        url: response.url,
        commentCount: response.descendants
    }
}

async function getComment(id: number): Promise<Comment> {
    const request = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    const response = await request.json();

    return {
        text: response.text,
        kids: response.kids,
        time: response.time,
        by: response.by,
        id: response.id,
        selected: false
    }
}

export async function getComments(ids: number[]): Promise<Comment[]> {
    const promises = ids.map(getComment);
    return await Promise.all(promises);
}