package me.khadimprojects.api.services;

import org.commonmark.ext.gfm.strikethrough.StrikethroughExtension;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarkdownService {

    public String toHTML(String markdownCode) {
        // Extention
        var strikethroughExtension = StrikethroughExtension.create();

        Parser parser = Parser.builder()
                .extensions(List.of(strikethroughExtension))
                .build();

        // Parse the markdown into nodes
        Node document = parser.parse(markdownCode);

        // Render the HTML tree
        return HtmlRenderer.builder()
                .extensions(List.of(strikethroughExtension))
                .build().render(document);
    }

}