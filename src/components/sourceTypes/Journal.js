export default function Journal() {
    return (
        <>
            <label htmlFor="url">URL</label>
            <input type="text" name="url" />
            <label htmlFor="title">Title</label>
            <input type="text" name="title" />
            <label htmlFor="author">Author</label>
            <input type="text" name="author" />
        </>
    );
}
