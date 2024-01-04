export default function Citation() {
    function handleCitationFormSubmit(event) {
        event.preventDefault();
    }

    return (
        <div className="citation">
            <form className="citation-form" onSubmit={handleCitationFormSubmit}>
                <label htmlFor="title">Title</label>
                <input type="text" name="title" />
                <label htmlFor="author">Author</label>
                <input type="text" name="author" />
                <button type="submit">Generate Citation</button>
            </form>
        </div>
    );
}
