import { delay, getBySelector, setEndOfContenteditable, updateEventFieldFromFrontend } from "../src/frontend-utils";
import { EventField, EventSQL} from "../src/common-interfaces";

export function EditableEventHeading({
  headingText,
  fieldName,
  event,
  placeholder,
  className,
  prefix,
  allowNewlines,
}: {
  headingText: string;
  fieldName: EventField;
  event: EventSQL;
  placeholder?: string;
  className?: string;
  prefix?: string;
  allowNewlines?: boolean;
}) {
  let oldValue = headingText;

  const toggleEditSave = async (fieldName: EventField) => {
    const heading = getBySelector<HTMLHeadingElement>(`.${fieldName}`);
    const button = getBySelector<HTMLButtonElement>(`.button-${fieldName}`);
    const isEditing = heading.isContentEditable;

    if (isEditing === false) {
      oldValue = heading.innerText;
      heading.contentEditable = "true";
      button.innerText = "Save";
      setTimeout(function () {
        heading.focus();
        setEndOfContenteditable(heading);
      }, 0);
    } else {
      // Go straight back to edit if text not changed
      const newValue = heading.innerText.trim();
      if (newValue === oldValue) {
        heading.contentEditable = "false";
        button.innerHTML = "Edit";
        return;
      }

      heading.contentEditable = "false";
      button.disabled = true;
      button.innerHTML = "Saving...";
      heading.innerText = newValue; // Remove trailing spaces if need be

      await updateEventFieldFromFrontend({
        eventId: event.id,
        field: fieldName,
        value: newValue,
      });

      button.innerHTML = "Saved";
      await delay(1000);
      button.disabled = false;
      button.innerHTML = "Edit";
    }
  };

  const headingOrPlaceholder = headingText.length === 0  && placeholder !== undefined ? placeholder : headingText;
  return (
    <div className="editable-event-heading">
      <h2>
        <span>{prefix}</span>
        <div
          style={{ display: "inline-block" }}
          className={`content ${className} ${fieldName} editable`}
          onBlur={async () => {
            const heading = getBySelector<HTMLHeadingElement>(`.${fieldName}`);
            if (heading.isContentEditable) {
              await toggleEditSave(fieldName);
            }
          }}
          onKeyDown={async (evt) => {
            if (evt.key === "Enter" && allowNewlines !== true) {
              evt.preventDefault();
              await toggleEditSave(fieldName);
            }
          }}
        >
          {headingOrPlaceholder}
        </div>
      </h2>
      <button
        className={`button-${fieldName}`}
        onClick={() => toggleEditSave(fieldName)}
      >
        Edit
      </button>
      <br></br>
    </div>
  );
}
