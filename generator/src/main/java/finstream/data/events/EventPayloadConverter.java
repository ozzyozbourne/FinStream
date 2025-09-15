package finstream.data.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EventPayloadConverter  implements AttributeConverter<Payload.Event, String> {

    private final ObjectMapper objectMapper;

    public EventPayloadConverter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public String convertToDatabaseColumn(Payload.Event attribute) {
        return "";
    }

    @Override
    public Payload.Event convertToEntityAttribute(String dbData) {
        return null;
    }
}
