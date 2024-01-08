export default function Journal() {
    // fetch(`https://api.crossref.org/works/${doi}`)
    //         .then((response) => response.json())
    //         .then((data) => console.log(data));

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
