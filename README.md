# fetch-notion

Github action that imports `nature-of-code` content on Notion as static HTMLs.

## Inputs

### `notion-secret`

**Required** The access secret for notion.

### `notion-database-id`

**Required** The `id` of the content database.

### `output-folder`

The output folder for HTMLs. Default `content/`.

## Example usage

```yaml
uses: nature-of-code/fetch-notion@main
with:
  notion-secret: ${{ secrets.NOTION_SECRET }}
  notion-database-id: ${{ secrets.NOTION_DATABASE_ID }}
```
