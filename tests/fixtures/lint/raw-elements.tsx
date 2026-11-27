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
      <input type="checkbox" name="agree" />
      <input type="hidden" name="draft" value="sample-1" />
      <progress value={40} max={100} />
      <table>
        <tbody />
      </table>
    </form>
  );
}
