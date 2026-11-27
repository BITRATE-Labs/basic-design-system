export function RawElements() {
  return (
    <form>
      <button type="button">Save</button>
      <dialog open>Draft saved</dialog>
      <input name="title" />
      <select name="size">
        <option>Small</option>
      </select>
      <textarea name="notes" />
    </form>
  );
}
