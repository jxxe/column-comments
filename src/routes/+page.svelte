<svelte:head>
    <title>Horizontal News — X Combinator</title>
</svelte:head>

<script lang="ts">
    import '../app.css';
    import { getComments, getStory, idFromUrl, type Comment, type Story } from '../helpers/api';

    let storyUrl = '';
    let columns: Comment[][] = [];
    let story: Story|false = false;
    let loading = false;
    let columnContainer: HTMLElement|false = false;

    async function loadStory() {
        loading = true;

        const id = idFromUrl(storyUrl);
        story = await getStory(id);

        const comments = await getComments(story.kids);
        columns.push(comments);
        columns = columns;

        loading = false;
    }

    async function selectComment(commentIndex: number, columnIndex: number) {
        loading = true;

        const comment = columns[columnIndex][commentIndex];
        const comments = await getComments(comment.kids);

        columns[columnIndex] = columns[columnIndex].map(comment => {
            if(!comment) console.log(columns[columnIndex]);
            comment.selected = false;
            return comment;
        });
        comment.selected = true;
        columns[columnIndex][commentIndex] = comment;

        columns = columns.slice(0, columnIndex + 1);
        columns.push(comments);
        columns = columns;

        setTimeout(() => {
            if(!columnContainer) return;
            columnContainer.scrollTo({
                left: document.body.scrollWidth * 2,
                top: 0,
                behavior: 'smooth'
            });
        }, 100);

        loading = false;
    }
</script>

<div bind:this={columnContainer} class="overflow-x-scroll flex h-screen transition-opacity" class:opacity-75={loading} class:pointer-events-none={loading}>
    {#if columns.length === 0}
        <div class="p-4 border-r w-96 space-y-4">
            <img class="h-12 mx-auto" src="/logo.svg" alt="">
            <div class="flex gap-2">
                <input required class="border outline-none focus:border-blue-500 w-full rounded-xl px-4 py-2" placeholder="Hacker News URL" bind:value={storyUrl} type="url">
                <button class="bg-blue-500 border border-blue-500 rounded-xl px-4 py-2 text-white" on:click={loadStory}>Load</button>
            </div>
        </div>
    {/if}

    {#key columns.length}
        {#each columns as comments, columnIndex}
            <div class="w-96 shrink-0 overflow-y-scroll [scrollbar-width:none] border-r">
                {#if story && columnIndex === 0}
                    <div class="border-b p-4 space-y-2">
                        <h1 class="font-bold text-lg leading-tight">{story.title}</h1>

                        <div class="text-center leading-none flex gap-2 text-sm">
                            <span class="font-bold">{story.by}</span>
                            <span>▲ {story.score.toLocaleString()}</span>
                            <span>💬 {story.commentCount.toLocaleString()}</span>
                        </div>
                    </div>
                {/if}

                {#each comments as comment, commentIndex}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div
                        on:click={() => comment.kids && selectComment(commentIndex, columnIndex)}
                        class="border-b p-4 space-y-2 border-r-blue-500"
                        class:bg-blue-50={comment.selected}
                        class:cursor-pointer={comment.kids}
                        class:border-r-2={comment.kids}
                    >
                        <div class="text-sm flex justify-between">
                            <span class="font-bold">{comment.by}</span>
                            <span class="text-gray-400">{new Date(comment.time * 1000).toLocaleString()}</span>
                        </div>

                        <p class="prose">{@html comment.text}</p>
                    </div>
                {/each}
            </div>
        {/each}
    {/key}
</div>