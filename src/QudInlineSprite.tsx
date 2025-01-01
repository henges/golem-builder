import { applyQudShader } from "./Colours";
import { QudSpriteRenderer, QudSpriteRendererProps } from "./QudSpriteRenderer";


export const QudInlineSprite = ({sprite, ...props}: QudSpriteRendererProps) => {

    return <>
        <QudSpriteRenderer display="inline" sprite={sprite} {...props}/>{" "}{applyQudShader(sprite.displayName)}
        </>;
}